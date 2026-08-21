from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from google.cloud.firestore_v1.base_query import FieldFilter

from ..audit import DocumentNotFoundError, record_deletion, record_status_change
from ..auth import AdminUser, require_admin_only, require_admin_user
from ..cms_models import ContentStatus, PageCreate, PageListResponse, PageOut, PageUpdate
from ..firestore_client import get_db
from ..sanitize import sanitize_html

router = APIRouter()


@router.get("/admin/pages", response_model=PageListResponse)
async def list_pages(
    status: ContentStatus | None = None,
    cursor: str | None = None,
    limit: int = Query(default=25, ge=1, le=100),
    user: AdminUser = Depends(require_admin_user),
) -> PageListResponse:
    db = get_db()
    query = db.collection("pages")
    if status is not None:
        query = query.where(filter=FieldFilter("status", "==", status))
    query = query.order_by("order")

    if cursor:
        cursor_snapshot = db.collection("pages").document(cursor).get()
        if cursor_snapshot.exists:
            query = query.start_after(cursor_snapshot)

    docs = list(query.limit(limit).stream())
    items = [PageOut(slug=doc.id, **(doc.to_dict() or {})) for doc in docs]
    next_cursor = docs[-1].id if len(docs) == limit else None

    return PageListResponse(items=items, nextCursor=next_cursor)


@router.get("/admin/pages/{slug}", response_model=PageOut)
async def get_page(slug: str, user: AdminUser = Depends(require_admin_user)) -> PageOut:
    snapshot = get_db().collection("pages").document(slug).get()
    if not snapshot.exists:
        raise HTTPException(status_code=404, detail="Page not found")
    return PageOut(slug=slug, **(snapshot.to_dict() or {}))


@router.post("/admin/pages", response_model=PageOut, status_code=201)
async def create_page(
    payload: PageCreate, user: AdminUser = Depends(require_admin_user)
) -> PageOut:
    db = get_db()
    doc_ref = db.collection("pages").document(payload.slug)
    if doc_ref.get().exists:
        raise HTTPException(status_code=409, detail="Slug already in use")

    now = datetime.now(UTC)
    data: dict[str, Any] = {
        "title": payload.title,
        "excerpt": payload.excerpt,
        "body": sanitize_html(payload.body),
        "seo": payload.seo.model_dump(),
        "order": payload.order,
        "status": "draft",
        "createdAt": now,
        "updatedAt": now,
        "publishedAt": None,
    }
    doc_ref.set(data)
    return PageOut(slug=payload.slug, **data)


@router.patch("/admin/pages/{slug}", response_model=PageOut)
async def update_page(
    slug: str, payload: PageUpdate, user: AdminUser = Depends(require_admin_user)
) -> PageOut:
    db = get_db()
    doc_ref = db.collection("pages").document(slug)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Page not found")

    doc_ref.update(
        {
            "title": payload.title,
            "excerpt": payload.excerpt,
            "body": sanitize_html(payload.body),
            "seo": payload.seo.model_dump(),
            "order": payload.order,
            "updatedAt": datetime.now(UTC),
        }
    )
    snapshot = doc_ref.get()
    return PageOut(slug=slug, **(snapshot.to_dict() or {}))


@router.post("/admin/pages/{slug}/publish", response_model=PageOut)
async def publish_page(slug: str, user: AdminUser = Depends(require_admin_user)) -> PageOut:
    db = get_db()
    try:
        record_status_change(
            db,
            collection="pages",
            doc_id=slug,
            new_status="published",
            actor=user,
            action="page.published",
            extra_fields={"publishedAt": datetime.now(UTC)},
        )
    except DocumentNotFoundError:
        raise HTTPException(status_code=404, detail="Page not found") from None

    snapshot = db.collection("pages").document(slug).get()
    return PageOut(slug=slug, **(snapshot.to_dict() or {}))


@router.post("/admin/pages/{slug}/unpublish", response_model=PageOut)
async def unpublish_page(slug: str, user: AdminUser = Depends(require_admin_user)) -> PageOut:
    db = get_db()
    try:
        record_status_change(
            db,
            collection="pages",
            doc_id=slug,
            new_status="draft",
            actor=user,
            action="page.unpublished",
        )
    except DocumentNotFoundError:
        raise HTTPException(status_code=404, detail="Page not found") from None

    snapshot = db.collection("pages").document(slug).get()
    return PageOut(slug=slug, **(snapshot.to_dict() or {}))


@router.delete("/admin/pages/{slug}", status_code=204)
async def delete_page(slug: str, user: AdminUser = Depends(require_admin_only)) -> None:
    db = get_db()
    doc_ref = db.collection("pages").document(slug)
    snapshot = doc_ref.get()
    if not snapshot.exists:
        raise HTTPException(status_code=404, detail="Page not found")

    data = snapshot.to_dict() or {}
    record_deletion(
        db,
        collection="pages",
        doc_id=slug,
        actor=user,
        action="page.deleted",
        snapshot_data={"title": data.get("title", "")},
    )
    doc_ref.delete()
