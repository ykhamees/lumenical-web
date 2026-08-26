from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """All external integrations are optional and degrade gracefully when
    unset — mirrors the marketing site's own NEXT_PUBLIC_* pattern. Never
    hardcode a real key; local dev runs entirely against the Firestore
    emulator with every integration unset.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    gcp_project_id: str = "lumenical-web"
    storage_bucket: str = "lumenical-web.firebasestorage.app"

    # Cloudflare Turnstile (O-4). Unset => bot-check is skipped (dev/local only;
    # production must always have this set).
    turnstile_secret_key: str | None = None

    # Resend (O-3). Unset => outbound email is skipped, logged as "skipped".
    resend_api_key: str | None = None
    notify_email: str = "hello@lumenical.com"
    from_email: str = "Lumenical <hello@lumenical.com>"

    # Rate limiting (per docs/build-plan.md 3.4).
    rate_limit_per_ip_per_window: int = 5
    rate_limit_window_seconds: int = 600  # 10 minutes
    rate_limit_per_email_per_day: int = 3

    # GitHub repository_dispatch (build-plan.md 4.7). Unset => publish/
    # unpublish still succeed (Firestore is the durable write); the static
    # site just doesn't rebuild until the next push to main.
    github_dispatch_token: str | None = None
    github_repository: str | None = None  # "owner/repo"


settings = Settings()
