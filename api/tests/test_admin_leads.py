from datetime import UTC, datetime

from fastapi.testclient import TestClient
from google.cloud.firestore_v1.base_query import FieldFilter


def _seed_lead(status: str = "new", **overrides: object) -> str:
    from app.firestore_client import get_db

    db = get_db()
    data: dict[str, object] = {
        "name": "Ada Lovelace",
        "email": "ada@example.com",
        "companySize": "5-20",
        "message": "Tell me more.",
        "status": status,
        "createdAt": datetime.now(UTC),
    }
    data.update(overrides)
    _, ref = db.collection("leads").add(data)
    return ref.id


def test_requires_auth(client: TestClient) -> None:
    resp = client.get("/api/admin/leads")
    assert resp.status_code == 401


def test_list_leads_paginates(client: TestClient, admin_token: str) -> None:
    for i in range(3):
        _seed_lead(name=f"Lead {i}")

    resp = client.get(
        "/api/admin/leads",
        params={"limit": 2},
        headers={"X-Firebase-Id-Token": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["items"]) == 2
    assert body["nextCursor"] is not None

    resp2 = client.get(
        "/api/admin/leads",
        params={"limit": 2, "cursor": body["nextCursor"]},
        headers={"X-Firebase-Id-Token": f"Bearer {admin_token}"},
    )
    assert resp2.status_code == 200
    body2 = resp2.json()
    first_ids = {item["id"] for item in body["items"]}
    second_ids = {item["id"] for item in body2["items"]}
    assert first_ids.isdisjoint(second_ids)


def test_list_leads_filters_by_status(client: TestClient, admin_token: str) -> None:
    _seed_lead(status="won")
    _seed_lead(status="lost")

    resp = client.get(
        "/api/admin/leads",
        params={"status": "won"},
        headers={"X-Firebase-Id-Token": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["items"]) >= 1
    assert all(item["status"] == "won" for item in body["items"])


def test_get_lead_404_for_unknown_id(client: TestClient, admin_token: str) -> None:
    resp = client.get(
        "/api/admin/leads/does-not-exist",
        headers={"X-Firebase-Id-Token": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 404


def test_update_status_writes_audit_log(client: TestClient, admin_token: str) -> None:
    lead_id = _seed_lead(status="new")

    resp = client.patch(
        f"/api/admin/leads/{lead_id}",
        json={"status": "contacted"},
        headers={"X-Firebase-Id-Token": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "contacted"

    from app.firestore_client import get_db

    db = get_db()
    audit_docs = list(
        db.collection("auditLog")
        .where(filter=FieldFilter("targetId", "==", lead_id))
        .stream()
    )
    assert len(audit_docs) == 1
    entry = audit_docs[0].to_dict()
    assert entry is not None
    assert entry["action"] == "lead.status_changed"
    assert entry["before"] == {"status": "new"}
    assert entry["after"] == {"status": "contacted"}
    assert entry["actorEmail"] is not None


def test_update_status_404_for_unknown_id(client: TestClient, admin_token: str) -> None:
    resp = client.patch(
        "/api/admin/leads/does-not-exist",
        json={"status": "contacted"},
        headers={"X-Firebase-Id-Token": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 404


def test_update_status_rejects_invalid_status(client: TestClient, admin_token: str) -> None:
    lead_id = _seed_lead()

    resp = client.patch(
        f"/api/admin/leads/{lead_id}",
        json={"status": "not-a-real-status"},
        headers={"X-Firebase-Id-Token": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 422


def test_add_note(client: TestClient, admin_token: str) -> None:
    lead_id = _seed_lead()

    resp = client.post(
        f"/api/admin/leads/{lead_id}/notes",
        json={"text": "Called, left voicemail."},
        headers={"X-Firebase-Id-Token": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    notes = resp.json()["notes"]
    assert len(notes) == 1
    assert notes[0]["text"] == "Called, left voicemail."
    assert notes[0]["authorEmail"] is not None


def test_add_note_404_for_unknown_id(client: TestClient, admin_token: str) -> None:
    resp = client.post(
        "/api/admin/leads/does-not-exist/notes",
        json={"text": "hi"},
        headers={"X-Firebase-Id-Token": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 404
