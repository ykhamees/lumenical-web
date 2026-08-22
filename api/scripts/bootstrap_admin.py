#!/usr/bin/env python
"""Scriptable first-admin bootstrap (docs/build-plan.md Phase 4.1).

Creates (or finds) a Firebase Auth user by email and sets the custom claim
{"role": "admin"} (or "editor") on it — the same claim firestore.rules'
hasRole()/isEditorOrAdmin() helpers and the API's require_admin_user()
dependency check against. Works against the local emulator
(set FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099) or a real project — same
env-var-driven pattern as the rest of this repo.

Usage (from api/, with `uv sync` already run):
    uv run python scripts/bootstrap_admin.py --email hello@lumenical.com \\
        --password 'a-real-password'
    uv run python scripts/bootstrap_admin.py --email someone@lumenical.com --role editor
"""

import argparse

from firebase_admin import auth as firebase_auth

from app.firebase_app import get_app


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--email", required=True)
    parser.add_argument(
        "--password",
        help="Only used if the user doesn't exist yet. Required for new users.",
    )
    parser.add_argument("--role", choices=["admin", "editor"], default="admin")
    args = parser.parse_args()

    get_app()

    try:
        user = firebase_auth.get_user_by_email(args.email)
        print(f"Found existing user {user.uid} ({args.email}).")
    except firebase_auth.UserNotFoundError:
        if not args.password:
            parser.error(
                f"No user with email {args.email} exists yet — pass --password to create one."
            )
        user = firebase_auth.create_user(email=args.email, password=args.password)
        print(f"Created new user {user.uid} ({args.email}).")

    firebase_auth.set_custom_user_claims(user.uid, {"role": args.role})
    print(
        f"Set role={args.role!r} on {args.email}. "
        "They must sign out and back in (or refresh their ID token) for it to take effect."
    )


if __name__ == "__main__":
    main()
