import uuid

from fastapi.testclient import TestClient
from google.cloud.firestore_v1.base_query import FieldFilter


def _slug() -> str:
    return f"test-demo-{uuid.uuid4().hex[:8]}"


def test_requires_auth(client: TestClient) -> None:
    resp = client.get("/api/admin/demos")
    assert resp.status_code == 401


def test_create_get_and_list_demo(client: TestClient, admin_token: str) -> None:
    slug = _slug()
    headers = {"Authorization": f"Bearer {admin_token}"}

    resp = client.post(
        "/api/admin/demos",
        json={
            "slug": slug,
            "title": "Test Demo",
            "kind": "product",
            "summary": "A test.",
            "body": "<p>Hi</p>",
        },
        headers=headers,
    )
    assert resp.status_code == 201
    body = resp.json()
    demo_id = body["id"]
    assert body["slug"] == slug
    assert body["status"] == "draft"

    resp = client.get(f"/api/admin/demos/{demo_id}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["title"] == "Test Demo"

    resp = client.get("/api/admin/demos", params={"status": "draft"}, headers=headers)
    assert resp.status_code == 200
    assert any(item["id"] == demo_id for item in resp.json()["items"])


def test_create_rejects_duplicate_slug(client: TestClient, admin_token: str) -> None:
    slug = _slug()
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {"slug": slug, "title": "First", "kind": "product", "body": ""}

    resp = client.post("/api/admin/demos", json=payload, headers=headers)
    assert resp.status_code == 201

    resp = client.post("/api/admin/demos", json=payload, headers=headers)
    assert resp.status_code == 409


def test_body_html_is_sanitized(client: TestClient, admin_token: str) -> None:
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = client.post(
        "/api/admin/demos",
        json={
            "slug": _slug(),
            "title": "XSS test",
            "kind": "product",
            "body": "<p>safe</p><script>alert(1)</script>",
        },
        headers=headers,
    )
    assert resp.status_code == 201
    assert "<script>" not in resp.json()["body"]
    assert "safe" in resp.json()["body"]


def test_update_demo(client: TestClient, admin_token: str) -> None:
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = client.post(
        "/api/admin/demos",
        json={"slug": _slug(), "title": "Old", "kind": "product", "body": ""},
        headers=headers,
    )
    demo_id = resp.json()["id"]
    new_slug = _slug()

    resp = client.patch(
        f"/api/admin/demos/{demo_id}",
        json={
            "slug": new_slug,
            "title": "New title",
            "kind": "case-study",
            "summary": "",
            "body": "<p>Updated</p>",
            "order": 3,
        },
        headers=headers,
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["title"] == "New title"
    assert body["slug"] == new_slug
    assert body["kind"] == "case-study"
    assert body["order"] == 3


def test_update_rejects_slug_collision_with_another_demo(
    client: TestClient, admin_token: str
) -> None:
    headers = {"Authorization": f"Bearer {admin_token}"}
    slug_a = _slug()
    slug_b = _slug()
    client.post(
        "/api/admin/demos",
        json={"slug": slug_a, "title": "A", "kind": "product", "body": ""},
        headers=headers,
    )
    resp_b = client.post(
        "/api/admin/demos",
        json={"slug": slug_b, "title": "B", "kind": "product", "body": ""},
        headers=headers,
    )
    demo_b_id = resp_b.json()["id"]

    resp = client.patch(
        f"/api/admin/demos/{demo_b_id}",
        json={"slug": slug_a, "title": "B", "kind": "product", "body": ""},
        headers=headers,
    )
    assert resp.status_code == 409


def test_update_allows_keeping_same_slug(client: TestClient, admin_token: str) -> None:
    headers = {"Authorization": f"Bearer {admin_token}"}
    slug = _slug()
    resp = client.post(
        "/api/admin/demos",
        json={"slug": slug, "title": "A", "kind": "product", "body": ""},
        headers=headers,
    )
    demo_id = resp.json()["id"]

    resp = client.patch(
        f"/api/admin/demos/{demo_id}",
        json={"slug": slug, "title": "A updated", "kind": "product", "body": ""},
        headers=headers,
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "A updated"


def test_update_404_for_unknown_id(client: TestClient, admin_token: str) -> None:
    resp = client.patch(
        "/api/admin/demos/does-not-exist",
        json={"slug": _slug(), "title": "x", "kind": "product", "body": ""},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 404


def test_publish_and_unpublish_writes_audit_log(client: TestClient, admin_token: str) -> None:
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = client.post(
        "/api/admin/demos",
        json={"slug": _slug(), "title": "T", "kind": "product", "body": ""},
        headers=headers,
    )
    demo_id = resp.json()["id"]

    resp = client.post(f"/api/admin/demos/{demo_id}/publish", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "published"
    assert body["publishedAt"] is not None

    resp = client.post(f"/api/admin/demos/{demo_id}/unpublish", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "draft"

    from app.firestore_client import get_db

    db = get_db()
    audit_docs = list(
        db.collection("auditLog").where(filter=FieldFilter("targetId", "==", demo_id)).stream()
    )
    actions = {doc.to_dict()["action"] for doc in audit_docs}
    assert "demo.published" in actions
    assert "demo.unpublished" in actions


def test_delete_requires_admin_role_not_editor(
    client: TestClient, admin_token: str, editor_token: str
) -> None:
    resp = client.post(
        "/api/admin/demos",
        json={"slug": _slug(), "title": "T", "kind": "product", "body": ""},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    demo_id = resp.json()["id"]

    resp = client.delete(
        f"/api/admin/demos/{demo_id}",
        headers={"Authorization": f"Bearer {editor_token}"},
    )
    assert resp.status_code == 403


def test_delete_demo(client: TestClient, admin_token: str) -> None:
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = client.post(
        "/api/admin/demos",
        json={"slug": _slug(), "title": "T", "kind": "product", "body": ""},
        headers=headers,
    )
    demo_id = resp.json()["id"]

    resp = client.delete(f"/api/admin/demos/{demo_id}", headers=headers)
    assert resp.status_code == 204

    resp = client.get(f"/api/admin/demos/{demo_id}", headers=headers)
    assert resp.status_code == 404

    from app.firestore_client import get_db

    db = get_db()
    audit_docs = list(
        db.collection("auditLog").where(filter=FieldFilter("targetId", "==", demo_id)).stream()
    )
    assert any(doc.to_dict()["action"] == "demo.deleted" for doc in audit_docs)
