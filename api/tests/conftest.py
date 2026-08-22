import os
import subprocess
import sys
import time
import uuid
from collections.abc import Iterator

import httpx
import pytest
from fastapi.testclient import TestClient

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080"
AUTH_EMULATOR_HOST = "127.0.0.1:9099"
STORAGE_EMULATOR_HOST = "127.0.0.1:9199"
TEST_PROJECT = "lumenical-ai-test"

# Set at conftest import time (collection), not inside the fixture below —
# some test modules import app.config/app.firestore_client at module level,
# which runs during collection too and freezes Settings.gcp_project_id
# (pydantic-settings reads GCP_PROJECT_ID, not GOOGLE_CLOUD_PROJECT) before a
# session-scoped fixture would ever get a chance to run. get_app() must init
# against the same project the emulator REST calls land users in, or
# verify_id_token()/get_user_by_email() silently miss them.
os.environ["FIRESTORE_EMULATOR_HOST"] = FIRESTORE_EMULATOR_HOST
os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = AUTH_EMULATOR_HOST
# google-cloud-storage (which firebase_admin.storage wraps) reads this
# specific name — no "FIREBASE_" prefix, unlike the Auth emulator's var.
os.environ["STORAGE_EMULATOR_HOST"] = f"http://{STORAGE_EMULATOR_HOST}"
os.environ["GOOGLE_CLOUD_PROJECT"] = TEST_PROJECT
os.environ["GCP_PROJECT_ID"] = TEST_PROJECT


@pytest.fixture(scope="session", autouse=True)
def emulators() -> Iterator[None]:
    """Starts the real Firestore + Auth emulators (via the Firebase CLI,
    reading firebase.json at the repo root) for the whole test session —
    no live GCP project touched, per docs/build-plan.md 3.1's accept
    criteria.
    """
    proc = subprocess.Popen(
        [
            "firebase",
            "emulators:start",
            "--only",
            "firestore,auth,storage",
            "--project",
            TEST_PROJECT,
        ],
        cwd=REPO_ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        shell=True,
        text=True,
    )

    def _kill() -> None:
        # `shell=True` on Windows spawns a cmd.exe wrapper around the real
        # firebase/node/java process tree — proc.terminate() only kills that
        # wrapper and orphans the emulator itself, still bound to the port
        # for every subsequent test run. taskkill /T kills the whole tree.
        if sys.platform == "win32":
            subprocess.run(
                ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                capture_output=True,
                check=False,
            )
        else:
            proc.terminate()
            try:
                proc.wait(timeout=15)
            except subprocess.TimeoutExpired:
                proc.kill()

    try:
        # 45s was tuned against a warm local machine that already had the
        # emulator JARs cached — a CI runner with no cache has to download
        # them (Firestore's especially) first, which alone can take longer
        # than that. Reproduced on the real GitHub Actions runner: every
        # test failed with "did not start in time" on api/'s first-ever CI
        # run, not a flaky one-off.
        _wait_for_http(f"http://{FIRESTORE_EMULATOR_HOST}/", timeout=120)
        _wait_for_http(f"http://{AUTH_EMULATOR_HOST}/", timeout=120)
        _wait_for_http(f"http://{STORAGE_EMULATOR_HOST}/", timeout=120)
    except Exception:
        # A startup failure here must still kill the subprocess — raising
        # before yield means pytest never runs the code below, which would
        # otherwise leak the emulator (and hold its ports) indefinitely.
        _kill()
        raise

    yield

    _kill()


def _wait_for_http(url: str, timeout: float) -> None:
    """Only cares that *something* is answering HTTP on the port — not
    that it's a 2xx. The Storage emulator's bare `GET /` always returns
    501 (no route registered there), which isn't a "not ready" signal, so
    checking status_code here would false-negative until the timeout.
    """
    deadline = time.monotonic() + timeout
    last_error: Exception | None = None
    while time.monotonic() < deadline:
        try:
            httpx.get(url, timeout=1.0)
            return
        except httpx.HTTPError as exc:
            last_error = exc
        time.sleep(0.5)
    raise RuntimeError(f"emulator at {url} did not start in time: {last_error}")


@pytest.fixture
def client() -> Iterator[TestClient]:
    # Imported lazily so the emulator env vars are set before firebase-admin
    # touches any credentials.
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client


def _emulator_auth_rest(endpoint: str, email: str, password: str) -> str:
    """Real ID token via the emulator's REST API — the same shape a real
    client would send, not a stand-in. The emulator doesn't validate the
    `key` query param, unlike production.
    """
    resp = httpx.post(
        f"http://{AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:{endpoint}",
        params={"key": "fake-api-key"},
        json={"email": email, "password": password, "returnSecureToken": True},
        timeout=5.0,
    )
    resp.raise_for_status()
    id_token: str = resp.json()["idToken"]
    return id_token


def create_user_and_get_token(email: str, password: str = "test-password-123") -> str:
    return _emulator_auth_rest("signUp", email, password)


def sign_in_and_get_token(email: str, password: str = "test-password-123") -> str:
    return _emulator_auth_rest("signInWithPassword", email, password)


@pytest.fixture
def admin_token() -> str:
    from firebase_admin import auth as firebase_auth

    from app.firebase_app import get_app

    get_app()
    email = f"admin-{uuid.uuid4().hex[:8]}@example.com"
    password = "test-password-123"
    create_user_and_get_token(email, password)

    uid = firebase_auth.get_user_by_email(email).uid
    firebase_auth.set_custom_user_claims(uid, {"role": "admin"})

    # Custom claims only appear in a *freshly minted* ID token, not the one
    # from signUp (issued before the claim was set) — sign in again.
    return sign_in_and_get_token(email, password)


@pytest.fixture
def no_role_token() -> str:
    email = f"norole-{uuid.uuid4().hex[:8]}@example.com"
    return create_user_and_get_token(email)


@pytest.fixture
def editor_token() -> str:
    from firebase_admin import auth as firebase_auth

    from app.firebase_app import get_app

    get_app()
    email = f"editor-{uuid.uuid4().hex[:8]}@example.com"
    password = "test-password-123"
    create_user_and_get_token(email, password)

    uid = firebase_auth.get_user_by_email(email).uid
    firebase_auth.set_custom_user_claims(uid, {"role": "editor"})

    return sign_in_and_get_token(email, password)
