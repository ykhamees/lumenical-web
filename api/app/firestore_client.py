from firebase_admin import firestore

from .firebase_app import get_app


def get_db() -> firestore.Client:
    get_app()
    return firestore.client()
