import uuid
from datetime import UTC, datetime

from fastapi.testclient import TestClient


def _seed_audit_entry(**overrides: object) -> str:
    from app.firestore_client import get_db

    db = get_db()
    data: dict[str, object] = {
        "action": "lead.status_changed",
        "targetCollection": "leads",
        "targetId": uuid.uuid4().hex,
        "actorUid": "test-uid",
        "actorEmail": "actor@example.com",
        "before": {"status": "new"},
        "after": {"status": "contacted"},
        "createdAt": datetime.now(UTC),
    }
    data.update(overrides)
    _, ref = db.collection("auditLog").add(data)
    return ref.id


def _seed_outbound_email(**overrides: object) -> str:
    from app.firestore_client import get_db

    db = get_db()
    data: dict[str, object] = {
        "to": "someone@example.com",
        "subject": "Test subject",
        "provider": "resend",
        "status": "sent",
        "relatedLeadId": None,
        "sentAt": datetime.now(UTC),
    }
    data.update(overrides)
    _, ref = db.collection("outboundEmails").add(data)
    return ref.id


def test_audit_log_requires_auth(client: TestClient) -> None:
    resp = client.get("/api/admin/audit-log")
    assert resp.status_code == 401


def test_audit_log_requires_admin_not_editor(client: TestClient, editor_token: str) -> None:
    resp = client.get(
        "/api/admin/audit-log", headers={"Authorization": f"Bearer {editor_token}"}
    )
    assert resp.status_code == 403


def test_audit_log_lists_and_filters(client: TestClient, admin_token: str) -> None:
    headers = {"Authorization": f"Bearer {admin_token}"}
    _seed_audit_entry(targetCollection="leads", action="lead.status_changed")
    _seed_audit_entry(targetCollection="pages", action="page.published")

    resp = client.get("/api/admin/audit-log", headers=headers)
    assert resp.status_code == 200
    assert len(resp.json()["items"]) >= 2

    resp = client.get(
        "/api/admin/audit-log", params={"targetCollection": "pages"}, headers=headers
    )
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["items"]) >= 1
    assert all(item["targetCollection"] == "pages" for item in body["items"])


def test_audit_log_paginates(client: TestClient, admin_token: str) -> None:
    headers = {"Authorization": f"Bearer {admin_token}"}
    for _ in range(3):
        _seed_audit_entry()

    resp = client.get("/api/admin/audit-log", params={"limit": 2}, headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["items"]) == 2
    assert body["nextCursor"] is not None

    resp2 = client.get(
        "/api/admin/audit-log",
        params={"limit": 2, "cursor": body["nextCursor"]},
        headers=headers,
    )
    assert resp2.status_code == 200
    first_ids = {item["id"] for item in body["items"]}
    second_ids = {item["id"] for item in resp2.json()["items"]}
    assert first_ids.isdisjoint(second_ids)


def test_outbound_emails_requires_auth(client: TestClient) -> None:
    resp = client.get("/api/admin/outbound-emails")
    assert resp.status_code == 401


def test_outbound_emails_requires_admin_not_editor(
    client: TestClient, editor_token: str
) -> None:
    resp = client.get(
        "/api/admin/outbound-emails", headers={"Authorization": f"Bearer {editor_token}"}
    )
    assert resp.status_code == 403


def test_outbound_emails_lists_and_filters(client: TestClient, admin_token: str) -> None:
    headers = {"Authorization": f"Bearer {admin_token}"}
    _seed_outbound_email(status="sent")
    _seed_outbound_email(status="failed", error="Provider outage")

    resp = client.get("/api/admin/outbound-emails", headers=headers)
    assert resp.status_code == 200
    assert len(resp.json()["items"]) >= 2

    resp = client.get(
        "/api/admin/outbound-emails", params={"status": "failed"}, headers=headers
    )
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["items"]) >= 1
    assert all(item["status"] == "failed" for item in body["items"])
    assert any(item["error"] == "Provider outage" for item in body["items"])
