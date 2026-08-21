import os

import firebase_admin
import google.auth.credentials
from firebase_admin import credentials, firestore

from .config import settings

_app: firebase_admin.App | None = None


def get_db() -> firestore.Client:
    """Initializes firebase-admin once per process.

    `firebase_admin.initialize_app()` always resolves real Application
    Default Credentials at init time — it does *not* skip that just because
    FIRESTORE_EMULATOR_HOST is set, unlike the lower-level Firestore
    transport, which redirects there regardless of credentials. So
    emulator-only local dev (and tests) needs an explicit anonymous
    credential, wrapped via firebase-admin's private (but stable —
    unchanged across recent SDK majors) `_ExternalCredentials`, since the
    SDK exposes no public wrapper for an arbitrary `google.auth.credentials`
    instance. Real Cloud Run deployments get the attached service account's
    ADC as normal.
    """
    global _app
    if _app is None:
        if os.environ.get("FIRESTORE_EMULATOR_HOST"):
            anonymous_creds = google.auth.credentials.AnonymousCredentials()  # type: ignore[no-untyped-call]
            cred = credentials._ExternalCredentials(anonymous_creds)  # noqa: SLF001
            _app = firebase_admin.initialize_app(
                cred, options={"projectId": settings.gcp_project_id}
            )
        else:
            _app = firebase_admin.initialize_app(
                options={"projectId": settings.gcp_project_id}
            )
    return firestore.client()
