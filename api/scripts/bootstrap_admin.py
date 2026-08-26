#!/usr/bin/env python
"""Scriptable first-admin bootstrap (docs/build-plan.md Phase 4.1).

Creates (or finds) a Firebase Auth user by email and sets the custom claim
{"role": "admin"} (or "editor") on it — the same claim firestore.rules'
hasRole()/isEditorOrAdmin() helpers and the API's require_admin_user()
dependency check against. Works against the local emulator
(set FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099) or a real project — same
env-var-driven pattern as the rest of this repo.

Google Sign-In is the only sign-in method now — there are no passwords to
set. A newly created placeholder user has no password and no linked
provider; Firebase's default "one account per email" behavior automatically
links it to the same uid the first time that person signs in with Google,
preserving the role claim set here.

Usage (from api/, with `uv sync` already run):
    uv run python scripts/bootstrap_admin.py --email hello@lumenical.com
    uv run python scripts/bootstrap_admin.py --email someone@lumenical.com --role editor
"""

import argparse

from firebase_admin import auth as firebase_auth

from app.auth import ALLOWED_EMAIL_DOMAIN
from app.firebase_app import get_app


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--email", required=True)
    parser.add_argument("--role", choices=["admin", "editor"], default="admin")
    args = parser.parse_args()

    email = args.email.strip().lower()
    if not email.endswith(f"@{ALLOWED_EMAIL_DOMAIN}"):
        parser.error(f"--email must be an @{ALLOWED_EMAIL_DOMAIN} address (got {args.email!r}).")

    get_app()

    try:
        user = firebase_auth.get_user_by_email(email)
        print(f"Found existing user {user.uid} ({email}).")
    except firebase_auth.UserNotFoundError:
        user = firebase_auth.create_user(email=email, email_verified=True)
        print(f"Created new user {user.uid} ({email}).")

    firebase_auth.set_custom_user_claims(user.uid, {"role": args.role})
    print(
        f"Set role={args.role!r} on {email}. "
        "They must sign in with Google (or refresh their session) for it to take effect."
    )


if __name__ == "__main__":
    main()
