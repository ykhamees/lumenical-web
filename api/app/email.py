from typing import Any

from firebase_admin import firestore

from .config import settings


def send_email(
    db: firestore.Client,
    *,
    to: str,
    subject: str,
    html: str,
    related_lead_id: str | None = None,
) -> None:
    """Best-effort send via Resend — always logged to `outboundEmails`
    regardless of outcome. A missing API key or a provider failure never
    raises: the caller's request must still succeed, since the lead is
    already durably stored before this is called.
    """
    log_entry: dict[str, Any] = {
        "to": to,
        "subject": subject,
        "provider": "resend",
        "relatedLeadId": related_lead_id,
        "sentAt": firestore.SERVER_TIMESTAMP,
    }

    if not settings.resend_api_key:
        log_entry["status"] = "skipped"
        log_entry["error"] = "RESEND_API_KEY not configured"
    else:
        try:
            import resend

            resend.api_key = settings.resend_api_key
            resend.Emails.send(
                {
                    "from": settings.from_email,
                    "to": to,
                    "subject": subject,
                    "html": html,
                }
            )
            log_entry["status"] = "sent"
        except Exception as exc:  # noqa: BLE001 — must never propagate
            log_entry["status"] = "failed"
            log_entry["error"] = str(exc)

    db.collection("outboundEmails").add(log_entry)
