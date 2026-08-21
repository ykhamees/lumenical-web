from fastapi import APIRouter, HTTPException, Request
from firebase_admin import firestore

from ..config import settings
from ..firestore_client import get_db
from ..models import NewsletterRequest, NewsletterResponse
from ..rate_limit import RateLimitExceeded, check_and_increment
from ..turnstile import verify_turnstile

router = APIRouter()


@router.post("/newsletter", response_model=NewsletterResponse)
async def subscribe(payload: NewsletterRequest, request: Request) -> NewsletterResponse:
    if payload.website:
        return NewsletterResponse()

    client_ip = request.client.host if request.client else "unknown"

    if not await verify_turnstile(payload.turnstile_token, client_ip):
        raise HTTPException(status_code=400, detail="Bot verification failed")

    db = get_db()

    try:
        check_and_increment(
            db,
            f"newsletter:ip:{client_ip}",
            settings.rate_limit_per_ip_per_window,
            settings.rate_limit_window_seconds,
        )
    except RateLimitExceeded as exc:
        raise HTTPException(
            status_code=429,
            detail="Too many requests",
            headers={"Retry-After": str(exc.retry_after_seconds)},
        ) from exc

    # Idempotent by design: the email is the document ID, so a repeat
    # subscribe just overwrites the same doc rather than duplicating it.
    # Never reveals whether the email was already known.
    doc_id = payload.email.lower()
    db.collection("newsletterSubscribers").document(doc_id).set(
        {
            "email": payload.email,
            "status": "active",
            "subscribedAt": firestore.SERVER_TIMESTAMP,
        },
        merge=True,
    )

    return NewsletterResponse()
