from fastapi.testclient import TestClient


def test_requires_auth(client: TestClient) -> None:
    resp = client.get("/api/admin/deploy-status")
    assert resp.status_code == 401


def test_returns_not_configured_by_default(client: TestClient, admin_token: str) -> None:
    resp = client.get(
        "/api/admin/deploy-status", headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["configured"] is False
    assert body["status"] is None
