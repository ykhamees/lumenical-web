import os

import firebase_admin
import google.auth.credentials
from firebase_admin import credentials

from .config import settings

_app: firebase_admin.App | None = None


def get_app() -> firebase_admin.App:
    """Initializes firebase-admin once per process — shared by Firestore
    and Auth, since both need the same underlying App.

    `firebase_admin.initialize_app()` always resolves real Application
    Default Credentials at init time — it does *not* skip that just because
    FIRESTORE_EMULATOR_HOST/FIREBASE_AUTH_EMULATOR_HOST are set, unlike the
    lower-level Firestore/Auth transports, which redirect there regardless
    of credentials. So emulator-only local dev (and tests) needs an
    explicit anonymous credential, wrapped via firebase-admin's private
    (but stable — unchanged across recent SDK majors) `_ExternalCredentials`,
    since the SDK exposes no public wrapper for an arbitrary
    `google.auth.credentials` instance. Real Cloud Run deployments get the
    attached service account's ADC as normal.
    """
    global _app
    if _app is None:
        if os.environ.get("FIRESTORE_EMULATOR_HOST") or os.environ.get(
            "FIREBASE_AUTH_EMULATOR_HOST"
        ):
            anonymous_creds = google.auth.credentials.AnonymousCredentials()  # type: ignore[no-untyped-call]
            cred = credentials._ExternalCredentials(anonymous_creds)  # noqa: SLF001
            _app = firebase_admin.initialize_app(
                cred, options={"projectId": settings.gcp_project_id}
            )
        else:
            _app = firebase_admin.initialize_app(
                options={"projectId": settings.gcp_project_id}
            )
    return _app
