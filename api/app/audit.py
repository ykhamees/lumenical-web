from firebase_admin import firestore

from .auth import AdminUser


class DocumentNotFoundError(Exception):
    pass


def record_status_change(
    db: firestore.Client,
    *,
    collection: str,
    doc_id: str,
    new_status: str,
    actor: AdminUser,
    action: str,
    extra_fields: dict[str, object] | None = None,
) -> str:
    """Atomically updates {collection}/{doc_id}.status (plus any extra_fields,
    e.g. publishedAt) and writes a matching auditLog entry — either all of it
    happens or none of it does. Returns the status the document had before
    this change. Raises DocumentNotFoundError if the document doesn't exist.
    """
    doc_ref = db.collection(collection).document(doc_id)
    audit_ref = db.collection("auditLog").document()

    @firestore.transactional  # type: ignore[untyped-decorator] # firebase-admin ships no stubs
    def _run(transaction: firestore.Transaction) -> str:
        snapshot = doc_ref.get(transaction=transaction)
        if not snapshot.exists:
            raise DocumentNotFoundError(doc_id)

        before_status = str(snapshot.get("status"))
        updates: dict[str, object] = {"status": new_status, **(extra_fields or {})}
        transaction.update(doc_ref, updates)
        transaction.set(
            audit_ref,
            {
                "action": action,
                "targetCollection": collection,
                "targetId": doc_id,
                "actorUid": actor.uid,
                "actorEmail": actor.email,
                "before": {"status": before_status},
                "after": {"status": new_status},
                "createdAt": firestore.SERVER_TIMESTAMP,
            },
        )
        return before_status

    return str(_run(db.transaction()))
