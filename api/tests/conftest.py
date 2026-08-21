import os
import subprocess
import sys
import time
from collections.abc import Iterator

import httpx
import pytest
from fastapi.testclient import TestClient

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
EMULATOR_HOST = "127.0.0.1:8080"
TEST_PROJECT = "lumenical-ai-test"


@pytest.fixture(scope="session", autouse=True)
def firestore_emulator() -> Iterator[None]:
    """Starts the real Firestore emulator (via the Firebase CLI, reading
    firebase.json at the repo root) for the whole test session — no live
    GCP project touched, per docs/build-plan.md 3.1's accept criteria.
    """
    os.environ["FIRESTORE_EMULATOR_HOST"] = EMULATOR_HOST
    os.environ["GOOGLE_CLOUD_PROJECT"] = TEST_PROJECT

    proc = subprocess.Popen(
        [
            "firebase",
            "emulators:start",
            "--only",
            "firestore",
            "--project",
            TEST_PROJECT,
        ],
        cwd=REPO_ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        shell=True,
        text=True,
    )

    _wait_for_emulator(timeout=45)

    yield

    # `shell=True` on Windows spawns a cmd.exe wrapper around the real
    # firebase/node/java process tree — proc.terminate() only kills that
    # wrapper and orphans the emulator itself, still bound to the port for
    # every subsequent test run. taskkill /T kills the whole tree.
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


def _wait_for_emulator(timeout: float) -> None:
    deadline = time.monotonic() + timeout
    last_error: Exception | None = None
    while time.monotonic() < deadline:
        try:
            resp = httpx.get(f"http://{EMULATOR_HOST}/", timeout=1.0)
            if resp.status_code < 500:
                return
        except httpx.HTTPError as exc:
            last_error = exc
        time.sleep(0.5)
    raise RuntimeError(f"Firestore emulator did not start in time: {last_error}")


@pytest.fixture
def client() -> Iterator[TestClient]:
    # Imported lazily so FIRESTORE_EMULATOR_HOST is set before firebase-admin
    # touches any credentials.
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client
