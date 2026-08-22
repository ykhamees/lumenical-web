from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter

from ..audit import record_deletion
from ..auth import AdminUser, require_admin_only, require_admin_user
from ..firestore_client import get_db
from ..media_models import (
    ALLOWED_CONTENT_TYPES,
    MAX_UPLOAD_BYTES,
    MediaConfirmRequest,
    MediaListResponse,
    MediaOut,
    UploadUrlRequest,
    UploadUrlResponse,
)
from ..storage import (
    blob_exists,
    build_storage_path,
    create_signed_upload_url,
    delete_blob,
    public_url_for,
)

router = APIRouter()


@router.post("/admin/media/upload-url", response_model=UploadUrlResponse)
async def create_upload_url(
    payload: UploadUrlRequest, user: AdminUser = Depends(require_admin_user)
) -> UploadUrlResponse:
    if payload.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=422, detail="Unsupported content type")

    path = build_storage_path(payload.filename, public=payload.public)
    url = create_signed_upload_url(path, payload.content_type)
    return UploadUrlResponse(uploadUrl=url, storagePath=path)


@router.post("/admin/media", response_model=MediaOut, status_code=201)
async def confirm_upload(
    payload: MediaConfirmRequest, user: AdminUser = Depends(require_admin_user)
) -> MediaOut:
    if payload.size > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=422, detail="File too large")
    if not blob_exists(payload.storage_path):
        raise HTTPException(
            status_code=422, detail="Upload not found — did the upload complete?"
        )

    db = get_db()
    doc_ref = db.collection("media").document()
    data: dict[str, Any] = {
        "filename": payload.filename,
        "contentType": payload.content_type,
        "size": payload.size,
        "storagePath": payload.storage_path,
        "public": payload.public,
        "uploadedByUid": user.uid,
        "uploadedByEmail": user.email,
        "createdAt": datetime.now(UTC),
    }
    doc_ref.set(data)

    url = public_url_for(payload.storage_path) if payload.public else None
    return MediaOut(id=doc_ref.id, url=url, **data)


@router.get("/admin/media", response_model=MediaListResponse)
async def list_media(
    cursor: str | None = None,
    limit: int = Query(default=25, ge=1, le=100),
    user: AdminUser = Depends(require_admin_user),
) -> MediaListResponse:
    db = get_db()
    query = db.collection("media").order_by("createdAt", direction=firestore.Query.DESCENDING)

    if cursor:
        cursor_snapshot = db.collection("media").document(cursor).get()
        if cursor_snapshot.exists:
            query = query.start_after(cursor_snapshot)

    docs = list(query.limit(limit).stream())
    items = []
    for doc in docs:
        data = doc.to_dict() or {}
        url = public_url_for(data["storagePath"]) if data.get("public") else None
        items.append(MediaOut(id=doc.id, url=url, **data))
    next_cursor = docs[-1].id if len(docs) == limit else None

    return MediaListResponse(items=items, nextCursor=next_cursor)


@router.delete("/admin/media/{media_id}", status_code=204)
async def delete_media(
    media_id: str,
    force: bool = False,
    user: AdminUser = Depends(require_admin_only),
) -> None:
    db = get_db()
    doc_ref = db.collection("media").document(media_id)
    snapshot = doc_ref.get()
    if not snapshot.exists:
        raise HTTPException(status_code=404, detail="Asset not found")

    data = snapshot.to_dict() or {}
    asset_url = public_url_for(data["storagePath"]) if data.get("public") else None

    referenced_by: list[dict[str, str]] = []
    if asset_url:
        demo_docs = db.collection("demos").where(
            filter=FieldFilter("mediaUrl", "==", asset_url)
        ).stream()
        referenced_by = [
            {"id": d.id, "title": (d.to_dict() or {}).get("title", "")} for d in demo_docs
        ]

    if referenced_by and not force:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "This asset is referenced by other content.",
                "referencedBy": referenced_by,
            },
        )

    record_deletion(
        db,
        collection="media",
        doc_id=media_id,
        actor=user,
        action="media.deleted",
        snapshot_data={"filename": data.get("filename", ""), "storagePath": data["storagePath"]},
    )
    delete_blob(data["storagePath"])
    doc_ref.delete()
