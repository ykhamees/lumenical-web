from dataclasses import dataclass

from fastapi import Depends, Header, HTTPException
from firebase_admin import auth as firebase_auth

from .firebase_app import get_app

ROLES = ("admin", "editor")


@dataclass
class AdminUser:
    uid: str
    email: str | None
    role: str


def _extract_bearer_token(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    return authorization.removeprefix("Bearer ").strip()


async def require_admin_user(
    authorization: str | None = Header(default=None),
) -> AdminUser:
    """Verifies the Firebase ID token on every request — the client's own
    claim of a role is never trusted, only what's actually on the verified
    token. Requires `role` in {"admin", "editor"}, matching
    firestore.rules' `isEditorOrAdmin()` helper exactly.
    """
    get_app()
    token = _extract_bearer_token(authorization)

    try:
        decoded = firebase_auth.verify_id_token(token)
    except Exception as exc:  # noqa: BLE001 — any verification failure is just "unauthorized"
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc

    role = decoded.get("role")
    if role not in ROLES:
        raise HTTPException(status_code=403, detail="Insufficient role")

    return AdminUser(uid=decoded["uid"], email=decoded.get("email"), role=role)


async def require_admin_only(
    user: AdminUser = Depends(require_admin_user),
) -> AdminUser:
    """Stricter dependency for admin-only endpoints (e.g. managing other
    admin users) — editors are authenticated but not authorized here.
    """
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")
    return user
