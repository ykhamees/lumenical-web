import httpx
import pytest

from app.config import settings
from app.deploy import get_deploy_status, trigger_rebuild


@pytest.fixture(autouse=True)
def _reset_github_settings(monkeypatch: pytest.MonkeyPatch) -> None:
    # Other test files' publish/unpublish calls also go through
    # trigger_rebuild() — make sure none of them can accidentally fire a
    # real network call because a previous test left settings configured.
    monkeypatch.setattr(settings, "github_dispatch_token", None)
    monkeypatch.setattr(settings, "github_repository", None)


def test_trigger_rebuild_noop_when_unconfigured() -> None:
    assert trigger_rebuild("test") is False


def test_get_deploy_status_unconfigured() -> None:
    status = get_deploy_status()
    assert status.configured is False
    assert status.status is None


def test_trigger_rebuild_posts_dispatch(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(settings, "github_dispatch_token", "fake-token")
    monkeypatch.setattr(settings, "github_repository", "owner/repo")

    captured: dict[str, object] = {}

    def fake_post(url: str, **kwargs: object) -> httpx.Response:
        captured["url"] = url
        captured["json"] = kwargs.get("json")
        captured["headers"] = kwargs.get("headers")
        return httpx.Response(204, request=httpx.Request("POST", url))

    monkeypatch.setattr(httpx, "post", fake_post)

    assert trigger_rebuild("page.published:test-slug") is True
    assert captured["url"] == "https://api.github.com/repos/owner/repo/dispatches"
    assert captured["json"] == {
        "event_type": "content-published",
        "client_payload": {"reason": "page.published:test-slug"},
    }
    headers = captured["headers"]
    assert isinstance(headers, dict)
    assert headers["Authorization"] == "Bearer fake-token"


def test_trigger_rebuild_returns_false_on_http_error(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(settings, "github_dispatch_token", "fake-token")
    monkeypatch.setattr(settings, "github_repository", "owner/repo")

    def fake_post(url: str, **kwargs: object) -> httpx.Response:
        raise httpx.ConnectError("boom")

    monkeypatch.setattr(httpx, "post", fake_post)

    assert trigger_rebuild("test") is False


def test_get_deploy_status_reports_latest_run(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(settings, "github_dispatch_token", "fake-token")
    monkeypatch.setattr(settings, "github_repository", "owner/repo")

    def fake_get(url: str, **kwargs: object) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "workflow_runs": [
                    {
                        "status": "completed",
                        "conclusion": "success",
                        "html_url": "https://github.com/owner/repo/actions/runs/1",
                        "updated_at": "2026-08-22T00:00:00Z",
                    }
                ]
            },
            request=httpx.Request("GET", url),
        )

    monkeypatch.setattr(httpx, "get", fake_get)

    status = get_deploy_status()
    assert status.configured is True
    assert status.status == "completed"
    assert status.conclusion == "success"
    assert status.html_url == "https://github.com/owner/repo/actions/runs/1"


def test_get_deploy_status_no_runs_yet(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(settings, "github_dispatch_token", "fake-token")
    monkeypatch.setattr(settings, "github_repository", "owner/repo")

    def fake_get(url: str, **kwargs: object) -> httpx.Response:
        return httpx.Response(200, json={"workflow_runs": []}, request=httpx.Request("GET", url))

    monkeypatch.setattr(httpx, "get", fake_get)

    status = get_deploy_status()
    assert status.configured is True
    assert status.status is None


def test_get_deploy_status_http_error(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(settings, "github_dispatch_token", "fake-token")
    monkeypatch.setattr(settings, "github_repository", "owner/repo")

    def fake_get(url: str, **kwargs: object) -> httpx.Response:
        raise httpx.ConnectError("boom")

    monkeypatch.setattr(httpx, "get", fake_get)

    status = get_deploy_status()
    assert status.configured is True
    assert status.status == "error"
