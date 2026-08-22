from datetime import UTC, datetime

from fastapi.testclient import TestClient
from google.cloud.firestore_v1.base_query import FieldFilter


def _seed_subscriber(email: str, status: str = "active") -> str:
    from app.firestore_client import get_db

    db = get_db()
    doc_id = email.lower()
    db.collection("newsletterSubscribers").document(doc_id).set(
        {
            "email": email,
            "status": status,
            "subscribedAt": datetime.now(UTC),
        }
    )
    return doc_id


def test_requires_auth(client: TestClient) -> None:
    resp = client.get("/api/admin/newsletter")
    assert resp.status_code == 401


def test_list_subscribers(client: TestClient, admin_token: str) -> None:
    _seed_subscriber("one@example.com")
    _seed_subscriber("two@example.com")

    resp = client.get(
        "/api/admin/newsletter",
        headers={"X-Firebase-Id-Token": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    emails = {item["email"] for item in resp.json()["items"]}
    assert {"one@example.com", "two@example.com"} <= emails


def test_list_subscribers_filters_by_status(client: TestClient, admin_token: str) -> None:
    _seed_subscriber("active-sub@example.com", status="active")
    _seed_subscriber("gone-sub@example.com", status="unsubscribed")

    resp = client.get(
        "/api/admin/newsletter",
        params={"status": "unsubscribed"},
        headers={"X-Firebase-Id-Token": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["items"]) >= 1
    assert all(item["status"] == "unsubscribed" for item in body["items"])


def test_unsubscribe_writes_audit_log(client: TestClient, admin_token: str) -> None:
    doc_id = _seed_subscriber("unsub-me@example.com", status="active")

    resp = client.post(
        f"/api/admin/newsletter/{doc_id}/unsubscribe",
        headers={"X-Firebase-Id-Token": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "unsubscribed"

    from app.firestore_client import get_db

    db = get_db()
    audit_docs = list(
        db.collection("auditLog").where(filter=FieldFilter("targetId", "==", doc_id)).stream()
    )
    assert len(audit_docs) == 1
    entry = audit_docs[0].to_dict()
    assert entry is not None
    assert entry["action"] == "newsletter.unsubscribed"
    assert entry["before"] == {"status": "active"}
    assert entry["after"] == {"status": "unsubscribed"}


def test_unsubscribe_404_for_unknown_id(client: TestClient, admin_token: str) -> None:
    resp = client.post(
        "/api/admin/newsletter/does-not-exist/unsubscribe",
        headers={"X-Firebase-Id-Token": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 404


def test_export_returns_csv(client: TestClient, admin_token: str) -> None:
    _seed_subscriber("export-me@example.com")

    resp = client.get(
        "/api/admin/newsletter/export",
        headers={"X-Firebase-Id-Token": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/csv")
    assert "export-me@example.com" in resp.text
    assert resp.text.splitlines()[0] == "email,status,subscribedAt"
