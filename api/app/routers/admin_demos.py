from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter

from ..audit import DocumentNotFoundError, record_status_change
from ..auth import AdminUser, require_admin_only, require_admin_user
from ..cms_models import ContentStatus, DemoCreate, DemoListResponse, DemoOut, DemoUpdate
from ..firestore_client import get_db
from ..sanitize import sanitize_html

router = APIRouter()


def _slug_taken(db: firestore.Client, slug: str, exclude_id: str | None = None) -> bool:
    docs = db.collection("demos").where(filter=FieldFilter("slug", "==", slug)).limit(2).stream()
    return any(doc.id != exclude_id for doc in docs)


@router.get("/admin/demos", response_model=DemoListResponse)
async def list_demos(
    status: ContentStatus | None = None,
    cursor: str | None = None,
    limit: int = Query(default=25, ge=1, le=100),
    user: AdminUser = Depends(require_admin_user),
) -> DemoListResponse:
    db = get_db()
    query = db.collection("demos")
    if status is not None:
        query = query.where(filter=FieldFilter("status", "==", status))
    query = query.order_by("order")

    if cursor:
        cursor_snapshot = db.collection("demos").document(cursor).get()
        if cursor_snapshot.exists:
            query = query.start_after(cursor_snapshot)

    docs = list(query.limit(limit).stream())
    items = [DemoOut(id=doc.id, **(doc.to_dict() or {})) for doc in docs]
    next_cursor = docs[-1].id if len(docs) == limit else None

    return DemoListResponse(items=items, nextCursor=next_cursor)


@router.get("/admin/demos/{demo_id}", response_model=DemoOut)
async def get_demo(demo_id: str, user: AdminUser = Depends(require_admin_user)) -> DemoOut:
    snapshot = get_db().collection("demos").document(demo_id).get()
    if not snapshot.exists:
        raise HTTPException(status_code=404, detail="Demo not found")
    return DemoOut(id=demo_id, **(snapshot.to_dict() or {}))


@router.post("/admin/demos", response_model=DemoOut, status_code=201)
async def create_demo(
    payload: DemoCreate, user: AdminUser = Depends(require_admin_user)
) -> DemoOut:
    db = get_db()
    if _slug_taken(db, payload.slug):
        raise HTTPException(status_code=409, detail="Slug already in use")

    doc_ref = db.collection("demos").document()
    now = datetime.now(UTC)
    data: dict[str, Any] = {
        "slug": payload.slug,
        "title": payload.title,
        "kind": payload.kind,
        "summary": payload.summary,
        "body": sanitize_html(payload.body),
        "mediaUrl": payload.media_url,
        "seo": payload.seo.model_dump(),
        "order": payload.order,
        "status": "draft",
        "createdAt": now,
        "updatedAt": now,
        "publishedAt": None,
    }
    doc_ref.set(data)
    return DemoOut(id=doc_ref.id, **data)


@router.patch("/admin/demos/{demo_id}", response_model=DemoOut)
async def update_demo(
    demo_id: str, payload: DemoUpdate, user: AdminUser = Depends(require_admin_user)
) -> DemoOut:
    db = get_db()
    doc_ref = db.collection("demos").document(demo_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Demo not found")

    if _slug_taken(db, payload.slug, exclude_id=demo_id):
        raise HTTPException(status_code=409, detail="Slug already in use")

    doc_ref.update(
        {
            "slug": payload.slug,
            "title": payload.title,
            "kind": payload.kind,
            "summary": payload.summary,
            "body": sanitize_html(payload.body),
            "mediaUrl": payload.media_url,
            "seo": payload.seo.model_dump(),
            "order": payload.order,
            "updatedAt": datetime.now(UTC),
        }
    )
    snapshot = doc_ref.get()
    return DemoOut(id=demo_id, **(snapshot.to_dict() or {}))


@router.post("/admin/demos/{demo_id}/publish", response_model=DemoOut)
async def publish_demo(demo_id: str, user: AdminUser = Depends(require_admin_user)) -> DemoOut:
    db = get_db()
    try:
        record_status_change(
            db,
            collection="demos",
            doc_id=demo_id,
            new_status="published",
            actor=user,
            action="demo.published",
            extra_fields={"publishedAt": datetime.now(UTC)},
        )
    except DocumentNotFoundError:
        raise HTTPException(status_code=404, detail="Demo not found") from None

    snapshot = db.collection("demos").document(demo_id).get()
    return DemoOut(id=demo_id, **(snapshot.to_dict() or {}))


@router.post("/admin/demos/{demo_id}/unpublish", response_model=DemoOut)
async def unpublish_demo(demo_id: str, user: AdminUser = Depends(require_admin_user)) -> DemoOut:
    db = get_db()
    try:
        record_status_change(
            db,
            collection="demos",
            doc_id=demo_id,
            new_status="draft",
            actor=user,
            action="demo.unpublished",
        )
    except DocumentNotFoundError:
        raise HTTPException(status_code=404, detail="Demo not found") from None

    snapshot = db.collection("demos").document(demo_id).get()
    return DemoOut(id=demo_id, **(snapshot.to_dict() or {}))


@router.delete("/admin/demos/{demo_id}", status_code=204)
async def delete_demo(demo_id: str, user: AdminUser = Depends(require_admin_only)) -> None:
    doc_ref = get_db().collection("demos").document(demo_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Demo not found")
    doc_ref.delete()
