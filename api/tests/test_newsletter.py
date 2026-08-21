from fastapi.testclient import TestClient
from google.cloud.firestore_v1.base_query import FieldFilter

from app.firestore_client import get_db


def test_subscribe_upserts_document(client: TestClient) -> None:
    db = get_db()

    resp = client.post("/api/newsletter", json={"email": "subscriber@example.com"})
    assert resp.status_code == 200
    assert resp.json() == {"ok": True}

    doc = db.collection("newsletterSubscribers").document("subscriber@example.com").get()
    assert doc.exists
    data = doc.to_dict()
    assert data is not None
    assert data["status"] == "active"


def test_subscribe_is_idempotent(client: TestClient) -> None:
    db = get_db()

    for _ in range(2):
        resp = client.post("/api/newsletter", json={"email": "idempotent@example.com"})
        assert resp.status_code == 200

    docs = list(
        db.collection("newsletterSubscribers")
        .where(filter=FieldFilter("email", "==", "idempotent@example.com"))
        .stream()
    )
    assert len(docs) == 1


def test_newsletter_honeypot_silently_discards(client: TestClient) -> None:
    db = get_db()

    resp = client.post(
        "/api/newsletter",
        json={"email": "bot2@example.com", "website": "http://spam.example"},
    )
    assert resp.status_code == 200
    doc = db.collection("newsletterSubscribers").document("bot2@example.com").get()
    assert not doc.exists
