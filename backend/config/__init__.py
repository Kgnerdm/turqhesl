# Make Celery app importable from anywhere via `from config import celery_app`
from .celery import app as celery_app

__all__ = ('celery_app',)
