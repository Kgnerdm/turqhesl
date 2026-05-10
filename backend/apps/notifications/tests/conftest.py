"""
Local fixtures for notification tests.

We turn on Celery eager mode and the locmem email backend so tests run
synchronously without a worker or SMTP server.
"""

import pytest


@pytest.fixture(autouse=True)
def _sync_celery_and_locmem_email(settings):
    settings.CELERY_TASK_ALWAYS_EAGER = True
    settings.CELERY_TASK_EAGER_PROPAGATES = True
    settings.EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
