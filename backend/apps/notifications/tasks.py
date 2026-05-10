"""
Celery tasks for transactional email.

Each task:
- Looks up the entity it needs by ID (don't pass model instances over the wire)
- Renders an email template
- Sends with retry + exponential backoff on transient failures (SMTP timeouts etc.)
"""

from __future__ import annotations

import logging

from celery import shared_task
from django.contrib.auth import get_user_model

from apps.bookings.models import Booking
from apps.providers.models import Provider

from .mailer import render_and_send

logger = logging.getLogger(__name__)

User = get_user_model()


# Manual retry helper. We use this rather than `autoretry_for=Exception` for
# portability across Python/Celery versions and so we can target only SMTP
# failures (model-not-found shouldn't retry).
RETRY_DEFAULTS = dict(max_retries=5, default_retry_delay=60)


def _retry_with_backoff(task, exc):
    """Retry the task with exponential backoff (60s, 120s, 240s, 480s, 600s).

    Skipped in eager mode (tests / dev sync mode) — there's no broker to
    schedule the retry against, and Celery's eager retry path is unstable on
    some Python builds. The failure is logged and re-raised so callers see it.
    """
    from django.conf import settings as _settings

    if getattr(_settings, 'CELERY_TASK_ALWAYS_EAGER', False):
        logger.exception('email task failed in eager mode; not retrying')
        raise exc

    countdown = min(60 * (2 ** task.request.retries), 600)
    raise task.retry(exc=exc, countdown=countdown)


@shared_task(bind=True, name='notifications.booking_confirmed', **RETRY_DEFAULTS)
def send_booking_confirmed_email(self, booking_id: int) -> int:
    """Sent to the patient when a provider confirms their booking."""
    try:
        booking = Booking.objects.select_related('provider', 'package').get(pk=booking_id)
    except Booking.DoesNotExist:
        logger.warning('booking_confirmed: booking %s not found', booking_id)
        return 0

    try:
        return render_and_send(
            template_base='booking_confirmed',
            subject=f'Your booking with {booking.provider.business_name} is confirmed',
            to=booking.patient_email,
            context={'booking': booking},
        )
    except Exception as exc:
        _retry_with_backoff(self, exc)


@shared_task(bind=True, name='notifications.booking_status_changed', **RETRY_DEFAULTS)
def send_booking_status_changed_email(self, booking_id: int, previous_status: str) -> int:
    """Sent to the patient on any non-confirmation status change."""
    try:
        booking = Booking.objects.select_related('provider', 'package').get(pk=booking_id)
    except Booking.DoesNotExist:
        logger.warning('booking_status_changed: booking %s not found', booking_id)
        return 0

    try:
        return render_and_send(
            template_base='booking_status_changed',
            subject=f'Your booking #{booking.id} is now {booking.get_status_display()}',
            to=booking.patient_email,
            context={'booking': booking, 'previous_status': previous_status},
        )
    except Exception as exc:
        _retry_with_backoff(self, exc)


@shared_task(bind=True, name='notifications.booking_cancelled', **RETRY_DEFAULTS)
def send_booking_cancelled_email(self, booking_id: int) -> int:
    """Sent to both patient and provider when a booking is cancelled."""
    try:
        booking = Booking.objects.select_related('provider__user', 'package').get(pk=booking_id)
    except Booking.DoesNotExist:
        logger.warning('booking_cancelled: booking %s not found', booking_id)
        return 0

    recipients = [booking.patient_email, booking.provider.user.email]
    try:
        return render_and_send(
            template_base='booking_cancelled',
            subject=f'Booking #{booking.id} has been cancelled',
            to=recipients,
            context={'booking': booking},
        )
    except Exception as exc:
        _retry_with_backoff(self, exc)


@shared_task(bind=True, name='notifications.provider_verified', **RETRY_DEFAULTS)
def send_provider_verified_email(self, provider_id: int) -> int:
    """Sent to the provider when an admin approves their verification."""
    try:
        provider = Provider.objects.select_related('user').get(pk=provider_id)
    except Provider.DoesNotExist:
        logger.warning('provider_verified: provider %s not found', provider_id)
        return 0

    try:
        return render_and_send(
            template_base='provider_verified',
            subject=f'{provider.business_name}: your TurqHeal profile is verified',
            to=provider.email,
            context={'provider': provider},
        )
    except Exception as exc:
        _retry_with_backoff(self, exc)


@shared_task(bind=True, name='notifications.provider_rejected', **RETRY_DEFAULTS)
def send_provider_rejected_email(self, provider_id: int, reason: str = '') -> int:
    """Sent to the provider when an admin rejects their verification."""
    try:
        provider = Provider.objects.select_related('user').get(pk=provider_id)
    except Provider.DoesNotExist:
        logger.warning('provider_rejected: provider %s not found', provider_id)
        return 0

    try:
        return render_and_send(
            template_base='provider_rejected',
            subject=f'{provider.business_name}: verification request update',
            to=provider.email,
            context={'provider': provider, 'reason': reason},
        )
    except Exception as exc:
        _retry_with_backoff(self, exc)


@shared_task(bind=True, name='notifications.password_reset', **RETRY_DEFAULTS)
def send_password_reset_email(self, user_id: int, reset_token: str) -> int:
    """Sent when a user requests a password reset link."""
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        logger.warning('password_reset: user %s not found', user_id)
        return 0

    try:
        return render_and_send(
            template_base='password_reset',
            subject='Reset your TurqHeal password',
            to=user.email,
            context={'user': user, 'reset_token': reset_token},
        )
    except Exception as exc:
        _retry_with_backoff(self, exc)
