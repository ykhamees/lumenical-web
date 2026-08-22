import os
import uuid
from datetime import timedelta
from functools import lru_cache

import google.auth.credentials
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from firebase_admin import storage
from google.auth import crypt
from google.cloud.storage import Bucket

from .firebase_app import get_app


class _EmulatorSigningCredentials(
    google.auth.credentials.AnonymousCredentials, google.auth.credentials.Signing
):
    """Satisfies generate_signed_url()'s signing requirement for local dev
    against the Storage emulator. AnonymousCredentials alone can't sign
    (there's no private key), and the emulator doesn't cryptographically
    verify the signature anyway — only Cloud Run's real attached service
    account signs for real, in production.
    """

    def __init__(self) -> None:
        super().__init__()  # type: ignore[no-untyped-call] # google-auth ships no stubs
        private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )
        self._signer: crypt.RSASigner = crypt.RSASigner.from_string(
            pem, key_id="emulator"
        )  # type: ignore[no-untyped-call]

    @property
    def signer_email(self) -> str:
        return "emulator@example.com"

    @property
    def signer(self) -> crypt.RSASigner:
        return self._signer

    def sign_bytes(self, message: bytes) -> bytes:
        return bytes(self._signer.sign(message))


@lru_cache(maxsize=1)
def _emulator_signing_credentials() -> _EmulatorSigningCredentials:
    return _EmulatorSigningCredentials()


def get_bucket() -> Bucket:
    get_app()
    return storage.bucket()


def build_storage_path(filename: str, *, public: bool) -> str:
    safe_name = filename.replace("/", "_")
    unique = uuid.uuid4().hex[:12]
    prefix = "public/media" if public else "media"
    return f"{prefix}/{unique}-{safe_name}"


def create_signed_upload_url(path: str, content_type: str) -> str:
    """A v4 signed PUT URL — the browser uploads bytes directly to storage,
    never through the API/Cloud Run, and never via a client-side write per
    storage.rules (the API is what authorizes and issues this URL).
    """
    blob = get_bucket().blob(path)
    credentials = (
        _emulator_signing_credentials() if os.environ.get("STORAGE_EMULATOR_HOST") else None
    )
    return str(
        blob.generate_signed_url(
            version="v4",
            expiration=timedelta(minutes=15),
            method="PUT",
            content_type=content_type,
            credentials=credentials,
        )
    )


def public_url_for(path: str) -> str:
    return f"https://storage.googleapis.com/{get_bucket().name}/{path}"


def blob_exists(path: str) -> bool:
    exists = get_bucket().blob(path).exists()
    return bool(exists)


def delete_blob(path: str) -> None:
    blob = get_bucket().blob(path)
    if blob.exists():
        blob.delete()
