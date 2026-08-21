import uuid

from fastapi.testclient import TestClient
from google.cloud.firestore_v1.base_query import FieldFilter


def _upload_and_confirm(
    client: TestClient, headers: dict[str, str], *, public: bool = True
) -> dict:
    """Gets a real signed URL from the API, then uploads the test bytes via
    the Admin SDK directly rather than PUTting to that URL.

    The Storage *emulator* only implements Firebase's own resumable-upload
    protocol, not the XML-API signed-URL PUT path generate_signed_url()
    produces — confirmed by hand: a PUT to an emulator-issued signed URL
    returns a bare 501 regardless of the signature. Real GCS supports this
    fully; this is an emulator-only gap, covered separately by
    test_upload_url_is_well_formed below.
    """
    resp = client.post(
        "/api/admin/media/upload-url",
        json={"filename": "poster.png", "contentType": "image/png", "public": public},
        headers=headers,
    )
    assert resp.status_code == 200
    body = resp.json()

    from app.storage import get_bucket

    get_bucket().blob(body["storagePath"]).upload_from_string(
        b"fake-png-bytes", content_type="image/png"
    )

    confirm = client.post(
        "/api/admin/media",
        json={
            "storagePath": body["storagePath"],
            "filename": "poster.png",
            "contentType": "image/png",
            "size": len(b"fake-png-bytes"),
            "public": public,
        },
        headers=headers,
    )
    assert confirm.status_code == 201
    return confirm.json()


def test_requires_auth(client: TestClient) -> None:
    resp = client.get("/api/admin/media")
    assert resp.status_code == 401


def test_upload_url_is_well_formed(client: TestClient, admin_token: str) -> None:
    resp = client.post(
        "/api/admin/media/upload-url",
        json={"filename": "poster.png", "contentType": "image/png", "public": True},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["storagePath"].startswith("public/media/")
    assert body["storagePath"].endswith("-poster.png")
    assert body["uploadUrl"].startswith("http")
    assert body["storagePath"] in body["uploadUrl"]
    assert "X-Goog-Signature" in body["uploadUrl"]


def test_upload_url_rejects_unsupported_content_type(
    client: TestClient, admin_token: str
) -> None:
    resp = client.post(
        "/api/admin/media/upload-url",
        json={"filename": "malware.exe", "contentType": "application/x-msdownload"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 422


def test_confirm_rejects_upload_that_never_happened(
    client: TestClient, admin_token: str
) -> None:
    resp = client.post(
        "/api/admin/media",
        json={
            "storagePath": "public/media/does-not-exist.png",
            "filename": "x.png",
            "contentType": "image/png",
            "size": 10,
            "public": True,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 422


def test_full_upload_flow_and_list(client: TestClient, admin_token: str) -> None:
    headers = {"Authorization": f"Bearer {admin_token}"}
    media = _upload_and_confirm(client, headers, public=True)

    assert media["filename"] == "poster.png"
    assert media["public"] is True
    assert media["url"] is not None
    assert media["uploadedByEmail"] is not None

    resp = client.get("/api/admin/media", headers=headers)
    assert resp.status_code == 200
    assert any(item["id"] == media["id"] for item in resp.json()["items"])


def test_private_upload_has_no_public_url(client: TestClient, admin_token: str) -> None:
    headers = {"Authorization": f"Bearer {admin_token}"}
    media = _upload_and_confirm(client, headers, public=False)
    assert media["public"] is False
    assert media["url"] is None


def test_delete_unreferenced_asset(client: TestClient, admin_token: str) -> None:
    headers = {"Authorization": f"Bearer {admin_token}"}
    media = _upload_and_confirm(client, headers, public=True)

    resp = client.delete(f"/api/admin/media/{media['id']}", headers=headers)
    assert resp.status_code == 204

    resp = client.get("/api/admin/media", headers=headers)
    assert not any(item["id"] == media["id"] for item in resp.json()["items"])


def test_delete_referenced_asset_warns_first(client: TestClient, admin_token: str) -> None:
    headers = {"Authorization": f"Bearer {admin_token}"}
    media = _upload_and_confirm(client, headers, public=True)

    demo_resp = client.post(
        "/api/admin/demos",
        json={
            # Firestore auto-IDs are mixed-case; slugs must be lowercase.
            "slug": f"demo-with-media-{uuid.uuid4().hex[:8]}",
            "title": "Demo referencing media",
            "kind": "product",
            "body": "",
            "mediaUrl": media["url"],
        },
        headers=headers,
    )
    assert demo_resp.status_code == 201

    resp = client.delete(f"/api/admin/media/{media['id']}", headers=headers)
    assert resp.status_code == 409
    detail = resp.json()["detail"]
    assert any(ref["title"] == "Demo referencing media" for ref in detail["referencedBy"])

    resp = client.delete(f"/api/admin/media/{media['id']}?force=true", headers=headers)
    assert resp.status_code == 204


def test_delete_requires_admin_role_not_editor(
    client: TestClient, admin_token: str, editor_token: str
) -> None:
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    media = _upload_and_confirm(client, admin_headers, public=True)

    resp = client.delete(
        f"/api/admin/media/{media['id']}",
        headers={"Authorization": f"Bearer {editor_token}"},
    )
    assert resp.status_code == 403


def test_delete_404_for_unknown_id(client: TestClient, admin_token: str) -> None:
    resp = client.delete(
        "/api/admin/media/does-not-exist",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 404


def test_editor_can_upload(client: TestClient, editor_token: str) -> None:
    headers = {"Authorization": f"Bearer {editor_token}"}
    media = _upload_and_confirm(client, headers, public=True)
    assert media["filename"] == "poster.png"

    # Cleanup goes through require_admin_only, so an editor can't tidy up
    # after themselves here — verify at least that reads still work.
    from app.firestore_client import get_db

    db = get_db()
    docs = list(
        db.collection("media").where(filter=FieldFilter("filename", "==", "poster.png")).stream()
    )
    assert len(docs) >= 1
