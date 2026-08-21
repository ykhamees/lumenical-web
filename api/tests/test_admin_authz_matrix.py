"""Phase 4.8 of docs/build-plan.md: every admin endpoint x every role,
asserting the expected authorization outcome — including anonymous.

This deliberately does not assert response *bodies* or full CRUD
correctness (that's what test_admin_leads.py etc. are for) — only the
authorization boundary. Most cases target a resource ID that doesn't
exist; require_admin_user()/require_admin_only() run as FastAPI
dependencies before the route body ever checks whether anything exists,
so an authorized caller gets a 404/409/422 (proof they got past auth),
never a 401/403 — while an unauthorized caller gets exactly 401 or 403
regardless of whether the resource is real.
"""

import pytest
from fastapi.testclient import TestClient

# (method, path, json body, {"editor"} if editors are also allowed, else
# set() for admin-only endpoints). Admin is always expected to pass.
ENDPOINTS: list[tuple[str, str, dict[str, object] | None, set[str]]] = [
    ("GET", "/api/admin/whoami", None, {"editor"}),
    ("GET", "/api/admin/leads", None, {"editor"}),
    ("GET", "/api/admin/leads/does-not-exist", None, {"editor"}),
    ("PATCH", "/api/admin/leads/does-not-exist", {"status": "contacted"}, {"editor"}),
    ("POST", "/api/admin/leads/does-not-exist/notes", {"text": "hi"}, {"editor"}),
    ("GET", "/api/admin/newsletter", None, {"editor"}),
    ("GET", "/api/admin/newsletter/export", None, {"editor"}),
    ("POST", "/api/admin/newsletter/does-not-exist/unsubscribe", None, {"editor"}),
    ("GET", "/api/admin/pages", None, {"editor"}),
    ("GET", "/api/admin/pages/does-not-exist", None, {"editor"}),
    (
        "POST",
        "/api/admin/pages",
        {"slug": "authz-matrix-page", "title": "T", "body": ""},
        {"editor"},
    ),
    ("PATCH", "/api/admin/pages/does-not-exist", {"title": "T", "body": ""}, {"editor"}),
    ("POST", "/api/admin/pages/does-not-exist/publish", None, {"editor"}),
    ("POST", "/api/admin/pages/does-not-exist/unpublish", None, {"editor"}),
    ("DELETE", "/api/admin/pages/does-not-exist", None, set()),
    ("GET", "/api/admin/demos", None, {"editor"}),
    ("GET", "/api/admin/demos/does-not-exist", None, {"editor"}),
    (
        "POST",
        "/api/admin/demos",
        {"slug": "authz-matrix-demo", "title": "T", "kind": "product", "body": ""},
        {"editor"},
    ),
    (
        "PATCH",
        "/api/admin/demos/does-not-exist",
        {"slug": "authz-matrix-demo-2", "title": "T", "kind": "product", "body": ""},
        {"editor"},
    ),
    ("POST", "/api/admin/demos/does-not-exist/publish", None, {"editor"}),
    ("POST", "/api/admin/demos/does-not-exist/unpublish", None, {"editor"}),
    ("DELETE", "/api/admin/demos/does-not-exist", None, set()),
    (
        "POST",
        "/api/admin/media/upload-url",
        {"filename": "x.png", "contentType": "image/png"},
        {"editor"},
    ),
    (
        "POST",
        "/api/admin/media",
        {
            "storagePath": "public/media/does-not-exist.png",
            "filename": "x.png",
            "contentType": "image/png",
            "size": 10,
            "public": True,
        },
        {"editor"},
    ),
    ("GET", "/api/admin/media", None, {"editor"}),
    ("DELETE", "/api/admin/media/does-not-exist", None, set()),
    ("GET", "/api/admin/audit-log", None, set()),
    ("GET", "/api/admin/outbound-emails", None, set()),
]


def _endpoint_id(value: object) -> str:
    if isinstance(value, tuple):
        return f"{value[0]}_{value[1]}"
    return str(value)


@pytest.mark.parametrize("method,path,body,editor_allowed", ENDPOINTS, ids=_endpoint_id)
def test_anonymous_is_rejected(
    client: TestClient,
    method: str,
    path: str,
    body: dict[str, object] | None,
    editor_allowed: set[str],
) -> None:
    resp = client.request(method, path, json=body)
    assert resp.status_code == 401


@pytest.mark.parametrize("method,path,body,editor_allowed", ENDPOINTS, ids=_endpoint_id)
def test_no_role_is_rejected(
    client: TestClient,
    no_role_token: str,
    method: str,
    path: str,
    body: dict[str, object] | None,
    editor_allowed: set[str],
) -> None:
    resp = client.request(
        method, path, json=body, headers={"Authorization": f"Bearer {no_role_token}"}
    )
    assert resp.status_code == 403


@pytest.mark.parametrize("method,path,body,editor_allowed", ENDPOINTS, ids=_endpoint_id)
def test_editor_authorization(
    client: TestClient,
    editor_token: str,
    method: str,
    path: str,
    body: dict[str, object] | None,
    editor_allowed: set[str],
) -> None:
    resp = client.request(
        method, path, json=body, headers={"Authorization": f"Bearer {editor_token}"}
    )
    if "editor" in editor_allowed:
        assert resp.status_code not in (401, 403), resp.text
    else:
        assert resp.status_code == 403


@pytest.mark.parametrize("method,path,body,editor_allowed", ENDPOINTS, ids=_endpoint_id)
def test_admin_authorization(
    client: TestClient,
    admin_token: str,
    method: str,
    path: str,
    body: dict[str, object] | None,
    editor_allowed: set[str],
) -> None:
    resp = client.request(
        method, path, json=body, headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp.status_code not in (401, 403), resp.text
