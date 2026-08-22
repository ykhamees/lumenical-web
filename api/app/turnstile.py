import httpx

from .config import settings

VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


async def verify_turnstile(token: str, remote_ip: str | None = None) -> bool:
    """True if verification passes. If TURNSTILE_SECRET_KEY isn't configured
    (local/dev only — production must always set it), verification is
    skipped and this returns True unconditionally.
    """
    if not settings.turnstile_secret_key:
        return True
    if not token:
        return False

    payload: dict[str, str] = {
        "secret": settings.turnstile_secret_key,
        "response": token,
    }
    if remote_ip:
        payload["remoteip"] = remote_ip

    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            resp = await client.post(VERIFY_URL, data=payload)
            resp.raise_for_status()
            return bool(resp.json().get("success"))
        except httpx.HTTPError:
            return False
