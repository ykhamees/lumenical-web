import uuid

from fastapi.testclient import TestClient
from google.cloud.firestore_v1.base_query import FieldFilter


def _slug() -> str:
    return f"test-page-{uuid.uuid4().hex[:8]}"


def test_requires_auth(client: TestClient) -> None:
    resp = client.get("/api/admin/pages")
    assert resp.status_code == 401


def test_create_get_and_list_page(client: TestClient, admin_token: str) -> None:
    slug = _slug()
    headers = {"Authorization": f"Bearer {admin_token}"}

    resp = client.post(
        "/api/admin/pages",
        json={"slug": slug, "title": "Test Page", "excerpt": "A test.", "body": "<p>Hi</p>"},
        headers=headers,
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["slug"] == slug
    assert body["status"] == "draft"
    assert body["publishedAt"] is None

    resp = client.get(f"/api/admin/pages/{slug}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["title"] == "Test Page"

    resp = client.get("/api/admin/pages", params={"status": "draft"}, headers=headers)
    assert resp.status_code == 200
    assert any(item["slug"] == slug for item in resp.json()["items"])


def test_create_rejects_duplicate_slug(client: TestClient, admin_token: str) -> None:
    slug = _slug()
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {"slug": slug, "title": "First", "body": ""}

    resp = client.post("/api/admin/pages", json=payload, headers=headers)
    assert resp.status_code == 201

    resp = client.post("/api/admin/pages", json=payload, headers=headers)
    assert resp.status_code == 409


def test_create_rejects_invalid_slug(client: TestClient, admin_token: str) -> None:
    resp = client.post(
        "/api/admin/pages",
        json={"slug": "Not A Valid Slug!", "title": "x", "body": ""},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 422


def test_body_html_is_sanitized(client: TestClient, admin_token: str) -> None:
    slug = _slug()
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = client.post(
        "/api/admin/pages",
        json={
            "slug": slug,
            "title": "XSS test",
            "body": "<p>safe</p><script>alert(1)</script>",
        },
        headers=headers,
    )
    assert resp.status_code == 201
    assert "<script>" not in resp.json()["body"]
    assert "safe" in resp.json()["body"]


def test_tags_round_trip(client: TestClient, admin_token: str) -> None:
    slug = _slug()
    headers = {"Authorization": f"Bearer {admin_token}"}

    resp = client.post(
        "/api/admin/pages",
        json={"slug": slug, "title": "T", "body": "", "tags": ["ai", "platforms"]},
        headers=headers,
    )
    assert resp.status_code == 201
    assert resp.json()["tags"] == ["ai", "platforms"]

    resp = client.get(f"/api/admin/pages/{slug}", headers=headers)
    assert resp.json()["tags"] == ["ai", "platforms"]

    resp = client.patch(
        f"/api/admin/pages/{slug}",
        json={"title": "T", "body": "", "tags": ["updated"]},
        headers=headers,
    )
    assert resp.json()["tags"] == ["updated"]


def test_create_defaults_to_no_tags(client: TestClient, admin_token: str) -> None:
    slug = _slug()
    resp = client.post(
        "/api/admin/pages",
        json={"slug": slug, "title": "T", "body": ""},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.json()["tags"] == []


def test_update_page(client: TestClient, admin_token: str) -> None:
    slug = _slug()
    headers = {"Authorization": f"Bearer {admin_token}"}
    client.post(
        "/api/admin/pages", json={"slug": slug, "title": "Old", "body": ""}, headers=headers
    )

    resp = client.patch(
        f"/api/admin/pages/{slug}",
        json={"title": "New title", "excerpt": "", "body": "<p>Updated</p>", "order": 5},
        headers=headers,
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["title"] == "New title"
    assert body["order"] == 5


def test_update_404_for_unknown_slug(client: TestClient, admin_token: str) -> None:
    resp = client.patch(
        "/api/admin/pages/does-not-exist",
        json={"title": "x", "body": ""},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 404


def test_publish_and_unpublish_writes_audit_log(client: TestClient, admin_token: str) -> None:
    slug = _slug()
    headers = {"Authorization": f"Bearer {admin_token}"}
    client.post("/api/admin/pages", json={"slug": slug, "title": "T", "body": ""}, headers=headers)

    resp = client.post(f"/api/admin/pages/{slug}/publish", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "published"
    assert body["publishedAt"] is not None

    resp = client.post(f"/api/admin/pages/{slug}/unpublish", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "draft"

    from app.firestore_client import get_db

    db = get_db()
    audit_docs = list(
        db.collection("auditLog").where(filter=FieldFilter("targetId", "==", slug)).stream()
    )
    actions = {doc.to_dict()["action"] for doc in audit_docs}
    assert "page.published" in actions
    assert "page.unpublished" in actions


def test_editor_can_create_and_publish_page(client: TestClient, editor_token: str) -> None:
    slug = _slug()
    headers = {"Authorization": f"Bearer {editor_token}"}

    resp = client.post(
        "/api/admin/pages", json={"slug": slug, "title": "T", "body": ""}, headers=headers
    )
    assert resp.status_code == 201

    resp = client.post(f"/api/admin/pages/{slug}/publish", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "published"


def test_delete_requires_admin_role_not_editor(
    client: TestClient, admin_token: str, editor_token: str
) -> None:
    slug = _slug()
    client.post(
        "/api/admin/pages",
        json={"slug": slug, "title": "T", "body": ""},
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    resp = client.delete(
        f"/api/admin/pages/{slug}",
        headers={"Authorization": f"Bearer {editor_token}"},
    )
    assert resp.status_code == 403


def test_delete_page(client: TestClient, admin_token: str) -> None:
    slug = _slug()
    headers = {"Authorization": f"Bearer {admin_token}"}
    client.post("/api/admin/pages", json={"slug": slug, "title": "T", "body": ""}, headers=headers)

    resp = client.delete(f"/api/admin/pages/{slug}", headers=headers)
    assert resp.status_code == 204

    resp = client.get(f"/api/admin/pages/{slug}", headers=headers)
    assert resp.status_code == 404

    from app.firestore_client import get_db

    db = get_db()
    audit_docs = list(
        db.collection("auditLog").where(filter=FieldFilter("targetId", "==", slug)).stream()
    )
    assert any(doc.to_dict()["action"] == "page.deleted" for doc in audit_docs)


def test_delete_404_for_unknown_slug(client: TestClient, admin_token: str) -> None:
    resp = client.delete(
        "/api/admin/pages/does-not-exist",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 404
