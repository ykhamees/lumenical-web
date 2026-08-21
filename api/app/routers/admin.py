from fastapi import APIRouter, Depends

from ..auth import AdminUser, require_admin_user

router = APIRouter()


@router.get("/admin/whoami")
async def whoami(user: AdminUser = Depends(require_admin_user)) -> dict[str, str | None]:
    return {"uid": user.uid, "email": user.email, "role": user.role}
