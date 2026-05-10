"""
Celery application for TurqHeal.

Used for async transactional emails today; will also process payment
webhooks (objective 3) and scheduled jobs (Celery Beat) later.

Run a worker with:
    celery -A config worker -l info
"""

import os

from celery import Celery
from dotenv import load_dotenv

# Make sure .env vars are available before reading them
load_dotenv()

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('turqheal')

# All Celery settings come from Django settings, prefixed with CELERY_
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks.py modules in every installed app
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Trivial task used to verify the worker can pick up jobs."""
    print(f'[celery] debug_task ran on {self.request.id}')
