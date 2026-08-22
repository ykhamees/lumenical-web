from fastapi import APIRouter, Depends

from ..auth import AdminUser, require_admin_user
from ..deploy import DeployStatusOut, get_deploy_status

router = APIRouter()


@router.get("/admin/deploy-status", response_model=DeployStatusOut)
async def deploy_status(user: AdminUser = Depends(require_admin_user)) -> DeployStatusOut:
    return get_deploy_status()
