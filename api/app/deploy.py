import httpx
from pydantic import BaseModel, ConfigDict, Field

from .config import settings

GITHUB_API_BASE = "https://api.github.com"
DEPLOY_WORKFLOW_FILE = "deploy.yml"


class DeployStatusOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    configured: bool
    status: str | None = None  # "queued" | "in_progress" | "completed" | "error" | None
    conclusion: str | None = None  # "success" | "failure" | ... | None
    html_url: str | None = Field(default=None, alias="htmlUrl")
    updated_at: str | None = Field(default=None, alias="updatedAt")


def _github_headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {settings.github_dispatch_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


def trigger_rebuild(reason: str) -> bool:
    """Best-effort — fires a `repository_dispatch` so deploy.yml rebuilds the
    static site with fresh Firestore content (A-3, build-plan.md 4.7). Never
    raises: the Firestore status change this follows has already durably
    happened, so a failed/skipped dispatch just means the site rebuilds on
    the next push to `main` instead of within ~5 minutes — not that
    anything is lost.
    """
    if not settings.github_dispatch_token or not settings.github_repository:
        return False

    try:
        response = httpx.post(
            f"{GITHUB_API_BASE}/repos/{settings.github_repository}/dispatches",
            headers=_github_headers(),
            json={"event_type": "content-published", "client_payload": {"reason": reason}},
            timeout=10.0,
        )
        return response.status_code == 204
    except httpx.HTTPError:
        return False


def get_deploy_status() -> DeployStatusOut:
    """Read-only — the admin console polls this after publish/unpublish so
    "published" never silently means "not live yet" (4.7's accept
    criterion). Reports the most recent run of deploy.yml regardless of
    what triggered it — the workflow's own concurrency group already
    coalesces overlapping publishes into one run.
    """
    if not settings.github_dispatch_token or not settings.github_repository:
        return DeployStatusOut(configured=False)

    try:
        response = httpx.get(
            f"{GITHUB_API_BASE}/repos/{settings.github_repository}/actions/workflows/"
            f"{DEPLOY_WORKFLOW_FILE}/runs",
            headers=_github_headers(),
            params={"per_page": 1},
            timeout=10.0,
        )
        response.raise_for_status()
        runs = response.json().get("workflow_runs", [])
    except httpx.HTTPError:
        return DeployStatusOut(configured=True, status="error")

    if not runs:
        return DeployStatusOut(configured=True)

    run = runs[0]
    return DeployStatusOut(
        configured=True,
        status=run.get("status"),
        conclusion=run.get("conclusion"),
        htmlUrl=run.get("html_url"),
        updatedAt=run.get("updated_at"),
    )
