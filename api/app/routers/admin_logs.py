from fastapi import APIRouter, Depends, Query
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter

from ..auth import AdminUser, require_admin_only
from ..firestore_client import get_db
from ..log_models import (
    AuditLogEntry,
    AuditLogListResponse,
    OutboundEmailEntry,
    OutboundEmailListResponse,
)

router = APIRouter()


@router.get("/admin/audit-log", response_model=AuditLogListResponse)
async def list_audit_log(
    target_collection: str | None = Query(default=None, alias="targetCollection"),
    cursor: str | None = None,
    limit: int = Query(default=25, ge=1, le=100),
    user: AdminUser = Depends(require_admin_only),
) -> AuditLogListResponse:
    db = get_db()
    query = db.collection("auditLog")
    if target_collection:
        query = query.where(filter=FieldFilter("targetCollection", "==", target_collection))
    query = query.order_by("createdAt", direction=firestore.Query.DESCENDING)

    if cursor:
        cursor_snapshot = db.collection("auditLog").document(cursor).get()
        if cursor_snapshot.exists:
            query = query.start_after(cursor_snapshot)

    docs = list(query.limit(limit).stream())
    items = [AuditLogEntry(id=doc.id, **(doc.to_dict() or {})) for doc in docs]
    next_cursor = docs[-1].id if len(docs) == limit else None

    return AuditLogListResponse(items=items, nextCursor=next_cursor)


@router.get("/admin/outbound-emails", response_model=OutboundEmailListResponse)
async def list_outbound_emails(
    status: str | None = None,
    cursor: str | None = None,
    limit: int = Query(default=25, ge=1, le=100),
    user: AdminUser = Depends(require_admin_only),
) -> OutboundEmailListResponse:
    db = get_db()
    query = db.collection("outboundEmails")
    if status:
        query = query.where(filter=FieldFilter("status", "==", status))
    query = query.order_by("sentAt", direction=firestore.Query.DESCENDING)

    if cursor:
        cursor_snapshot = db.collection("outboundEmails").document(cursor).get()
        if cursor_snapshot.exists:
            query = query.start_after(cursor_snapshot)

    docs = list(query.limit(limit).stream())
    items = [OutboundEmailEntry(id=doc.id, **(doc.to_dict() or {})) for doc in docs]
    next_cursor = docs[-1].id if len(docs) == limit else None

    return OutboundEmailListResponse(items=items, nextCursor=next_cursor)
