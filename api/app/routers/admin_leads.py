from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter

from ..admin_models import LeadListResponse, LeadNoteCreate, LeadOut, LeadStatus, LeadStatusUpdate
from ..audit import DocumentNotFoundError, record_status_change
from ..auth import AdminUser, require_admin_user
from ..firestore_client import get_db

router = APIRouter()


@router.get("/admin/leads", response_model=LeadListResponse)
async def list_leads(
    status: LeadStatus | None = None,
    cursor: str | None = None,
    limit: int = Query(default=25, ge=1, le=100),
    user: AdminUser = Depends(require_admin_user),
) -> LeadListResponse:
    db = get_db()
    query = db.collection("leads")
    if status is not None:
        query = query.where(filter=FieldFilter("status", "==", status))
    query = query.order_by("createdAt", direction=firestore.Query.DESCENDING)

    if cursor:
        cursor_snapshot = db.collection("leads").document(cursor).get()
        if cursor_snapshot.exists:
            query = query.start_after(cursor_snapshot)

    docs = list(query.limit(limit).stream())
    items = [LeadOut(id=doc.id, **(doc.to_dict() or {})) for doc in docs]
    next_cursor = docs[-1].id if len(docs) == limit else None

    return LeadListResponse(items=items, nextCursor=next_cursor)


@router.get("/admin/leads/{lead_id}", response_model=LeadOut)
async def get_lead(lead_id: str, user: AdminUser = Depends(require_admin_user)) -> LeadOut:
    snapshot = get_db().collection("leads").document(lead_id).get()
    if not snapshot.exists:
        raise HTTPException(status_code=404, detail="Lead not found")
    return LeadOut(id=lead_id, **(snapshot.to_dict() or {}))


@router.patch("/admin/leads/{lead_id}", response_model=LeadOut)
async def update_lead_status(
    lead_id: str,
    payload: LeadStatusUpdate,
    user: AdminUser = Depends(require_admin_user),
) -> LeadOut:
    db = get_db()
    try:
        record_status_change(
            db,
            collection="leads",
            doc_id=lead_id,
            new_status=payload.status,
            actor=user,
            action="lead.status_changed",
        )
    except DocumentNotFoundError:
        raise HTTPException(status_code=404, detail="Lead not found") from None

    snapshot = db.collection("leads").document(lead_id).get()
    return LeadOut(id=lead_id, **(snapshot.to_dict() or {}))


@router.post("/admin/leads/{lead_id}/notes", response_model=LeadOut)
async def add_lead_note(
    lead_id: str,
    payload: LeadNoteCreate,
    user: AdminUser = Depends(require_admin_user),
) -> LeadOut:
    db = get_db()
    doc_ref = db.collection("leads").document(lead_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Lead not found")

    note = {
        "text": payload.text,
        "authorUid": user.uid,
        "authorEmail": user.email,
        "createdAt": datetime.now(UTC),
    }
    doc_ref.update({"notes": firestore.ArrayUnion([note])})

    snapshot = doc_ref.get()
    return LeadOut(id=lead_id, **(snapshot.to_dict() or {}))
