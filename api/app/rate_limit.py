from datetime import UTC, datetime

from firebase_admin import firestore


class RateLimitExceeded(Exception):
    def __init__(self, retry_after_seconds: int) -> None:
        self.retry_after_seconds = retry_after_seconds
        super().__init__(f"rate limit exceeded, retry after {retry_after_seconds}s")


def _window_start(now: datetime, window_seconds: int) -> int:
    epoch = int(now.timestamp())
    return epoch - (epoch % window_seconds)


def check_and_increment(
    db: firestore.Client, key: str, limit: int, window_seconds: int
) -> None:
    """Fixed-window counter backed by `abuseCounters` (server-only per
    firestore.rules — no client ever reads or writes this collection
    directly). Raises RateLimitExceeded once `key` has already reached
    `limit` requests within the current window *before* this call — i.e.
    exactly `limit` requests are allowed per window, not `limit - 1`.
    """
    now = datetime.now(UTC)
    window_start = _window_start(now, window_seconds)
    doc_ref = db.collection("abuseCounters").document(f"{key}:{window_start}")

    @firestore.transactional  # type: ignore[untyped-decorator] # firebase-admin ships no stubs
    def _run(transaction: firestore.Transaction) -> bool:
        snapshot = doc_ref.get(transaction=transaction)
        count = (snapshot.get("count") or 0) if snapshot.exists else 0
        if count >= limit:
            return False
        transaction.set(
            doc_ref,
            {
                "count": count + 1,
                "windowStart": window_start,
                "expiresAt": window_start + window_seconds,
            },
        )
        return True

    allowed = _run(db.transaction())
    if not allowed:
        retry_after = window_start + window_seconds - int(now.timestamp())
        raise RateLimitExceeded(retry_after_seconds=max(retry_after, 1))
