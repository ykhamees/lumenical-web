from fastapi import APIRouter, HTTPException, Request
from firebase_admin import firestore

from ..config import settings
from ..email import send_email
from ..firestore_client import get_db
from ..models import LeadRequest, LeadResponse
from ..rate_limit import RateLimitExceeded, check_and_increment
from ..turnstile import verify_turnstile

router = APIRouter()


@router.post("/leads", response_model=LeadResponse)
async def create_lead(payload: LeadRequest, request: Request) -> LeadResponse:
    if payload.website:
        # Honeypot tripped — respond exactly as a real success would,
        # store nothing, and don't tip off the bot.
        return LeadResponse()

    client_ip = request.client.host if request.client else "unknown"

    if not await verify_turnstile(payload.turnstile_token, client_ip):
        raise HTTPException(status_code=400, detail="Bot verification failed")

    db = get_db()

    try:
        check_and_increment(
            db,
            f"lead:ip:{client_ip}",
            settings.rate_limit_per_ip_per_window,
            settings.rate_limit_window_seconds,
        )
        check_and_increment(
            db,
            f"lead:email:{payload.email.lower()}",
            settings.rate_limit_per_email_per_day,
            86400,
        )
    except RateLimitExceeded as exc:
        raise HTTPException(
            status_code=429,
            detail="Too many requests",
            headers={"Retry-After": str(exc.retry_after_seconds)},
        ) from exc

    _, lead_ref = db.collection("leads").add(
        {
            "name": payload.name,
            "email": payload.email,
            "companySize": payload.company_size,
            "message": payload.message,
            "status": "new",
            "createdAt": firestore.SERVER_TIMESTAMP,
        }
    )

    notify_html = (
        f"<p>{payload.name} ({payload.email}) — {payload.company_size}</p>"
        f"<p>{payload.message}</p>"
    )
    send_email(
        db,
        to=settings.notify_email,
        subject=f"New lead: {payload.name}",
        html=notify_html,
        related_lead_id=lead_ref.id,
    )
    send_email(
        db,
        to=payload.email,
        subject="Thanks for reaching out to Lumenical",
        html="<p>Thanks — we'll be in touch within one business day.</p>",
        related_lead_id=lead_ref.id,
    )

    return LeadResponse()
