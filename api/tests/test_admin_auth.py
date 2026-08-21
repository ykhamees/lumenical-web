from fastapi.testclient import TestClient


def test_whoami_requires_a_token(client: TestClient) -> None:
    resp = client.get("/api/admin/whoami")
    assert resp.status_code == 401


def test_whoami_rejects_a_user_with_no_role(client: TestClient, no_role_token: str) -> None:
    resp = client.get(
        "/api/admin/whoami", headers={"Authorization": f"Bearer {no_role_token}"}
    )
    assert resp.status_code == 403


def test_whoami_rejects_garbage_token(client: TestClient) -> None:
    resp = client.get(
        "/api/admin/whoami", headers={"Authorization": "Bearer not-a-real-token"}
    )
    assert resp.status_code == 401


def test_whoami_accepts_an_admin_token(client: TestClient, admin_token: str) -> None:
    resp = client.get(
        "/api/admin/whoami", headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["role"] == "admin"
    assert body["email"] is not None
