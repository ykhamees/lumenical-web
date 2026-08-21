import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter

from ..admin_models import NewsletterListResponse, NewsletterStatus, NewsletterSubscriberOut
from ..audit import DocumentNotFoundError, record_status_change
from ..auth import AdminUser, require_admin_user
from ..firestore_client import get_db

router = APIRouter()


@router.get("/admin/newsletter", response_model=NewsletterListResponse)
async def list_subscribers(
    status: NewsletterStatus | None = None,
    cursor: str | None = None,
    limit: int = Query(default=25, ge=1, le=100),
    user: AdminUser = Depends(require_admin_user),
) -> NewsletterListResponse:
    db = get_db()
    query = db.collection("newsletterSubscribers")
    if status is not None:
        query = query.where(filter=FieldFilter("status", "==", status))
    query = query.order_by("subscribedAt", direction=firestore.Query.DESCENDING)

    if cursor:
        cursor_snapshot = db.collection("newsletterSubscribers").document(cursor).get()
        if cursor_snapshot.exists:
            query = query.start_after(cursor_snapshot)

    docs = list(query.limit(limit).stream())
    items = [NewsletterSubscriberOut(id=doc.id, **(doc.to_dict() or {})) for doc in docs]
    next_cursor = docs[-1].id if len(docs) == limit else None

    return NewsletterListResponse(items=items, nextCursor=next_cursor)


@router.get("/admin/newsletter/export")
async def export_subscribers(
    user: AdminUser = Depends(require_admin_user),
) -> StreamingResponse:
    docs = (
        get_db()
        .collection("newsletterSubscribers")
        .order_by("subscribedAt", direction=firestore.Query.DESCENDING)
        .stream()
    )

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["email", "status", "subscribedAt"])
    for doc in docs:
        data = doc.to_dict() or {}
        subscribed_at = data.get("subscribedAt")
        writer.writerow(
            [
                data.get("email", ""),
                data.get("status", ""),
                subscribed_at.isoformat() if subscribed_at else "",
            ]
        )

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=newsletter-subscribers.csv"},
    )


@router.post("/admin/newsletter/{doc_id}/unsubscribe", response_model=NewsletterSubscriberOut)
async def unsubscribe_subscriber(
    doc_id: str, user: AdminUser = Depends(require_admin_user)
) -> NewsletterSubscriberOut:
    db = get_db()
    try:
        record_status_change(
            db,
            collection="newsletterSubscribers",
            doc_id=doc_id,
            new_status="unsubscribed",
            actor=user,
            action="newsletter.unsubscribed",
        )
    except DocumentNotFoundError:
        raise HTTPException(status_code=404, detail="Subscriber not found") from None

    snapshot = db.collection("newsletterSubscribers").document(doc_id).get()
    return NewsletterSubscriberOut(id=doc_id, **(snapshot.to_dict() or {}))
