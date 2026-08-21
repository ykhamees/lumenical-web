import pytest
from fastapi.testclient import TestClient

from app import config
from app.firestore_client import get_db


def test_create_lead_writes_one_document(client: TestClient) -> None:
    db = get_db()
    before_ids = {doc.id for doc in db.collection("leads").stream()}

    resp = client.post(
        "/api/leads",
        json={
            "name": "Ada Lovelace",
            "email": "ada@example.com",
            "companySize": "5-20",
            "message": "Tell me more.",
        },
    )

    assert resp.status_code == 200
    assert resp.json() == {"ok": True}

    # Firestore's stream() order is unspecified, and other test files share
    # this same emulator collection within the session — identify the new
    # doc by set difference, not by position.
    after = list(db.collection("leads").stream())
    new_docs = [d for d in after if d.id not in before_ids]
    assert len(new_docs) == 1
    doc = new_docs[0].to_dict()
    assert doc is not None
    assert doc["name"] == "Ada Lovelace"
    assert doc["email"] == "ada@example.com"
    assert doc["status"] == "new"


def test_honeypot_silently_discards(client: TestClient) -> None:
    db = get_db()
    before = len(list(db.collection("leads").stream()))

    resp = client.post(
        "/api/leads",
        json={
            "name": "Bot",
            "email": "bot@example.com",
            "companySize": "",
            "message": "spam",
            "website": "http://spam.example",
        },
    )

    assert resp.status_code == 200
    assert resp.json() == {"ok": True}
    after = list(db.collection("leads").stream())
    assert len(after) == before


def test_invalid_company_size_rejected(client: TestClient) -> None:
    resp = client.post(
        "/api/leads",
        json={
            "name": "Ada",
            "email": "ada2@example.com",
            "companySize": "not-a-real-size",
            "message": "hi",
        },
    )
    assert resp.status_code == 422


def test_rate_limit_returns_429_with_retry_after(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(config.settings, "rate_limit_per_ip_per_window", 1000)
    monkeypatch.setattr(config.settings, "rate_limit_per_email_per_day", 3)

    payload = {
        "name": "Repeat",
        "email": "repeat-limit-test@example.com",
        "companySize": "",
        "message": "hi",
    }
    for _ in range(3):
        resp = client.post("/api/leads", json=payload)
        assert resp.status_code == 200

    resp = client.post("/api/leads", json=payload)
    assert resp.status_code == 429
    assert "Retry-After" in resp.headers
