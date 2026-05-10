"""
Helpers for creating in-app notifications.

Called from booking, provider, and payment lifecycle hooks. These are
synchronous DB inserts — the work is small enough that pushing it through
Celery would be overhead. Email tasks (which DO go through Celery) run
alongside.
"""

from __future__ import annotations

from .models import Notification


def notify(
    *,
    user,
    notification_type: str,
    title: str,
    message: str = '',
    link: str = '',
) -> Notification | None:
    """Create a single notification. Returns None if user is None (defensive)."""
    if user is None or not getattr(user, 'pk', None):
        return None
    return Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        link=link,
    )


def notify_booking_confirmed(booking) -> Notification | None:
    return notify(
        user=booking.patient,
        notification_type=Notification.Type.BOOKING_CONFIRMED,
        title=f'Booking confirmed by {booking.provider.business_name}',
        message=f'Your appointment is on {booking.appointment_date}.',
        link=f'/dashboard/patient',
    )


def notify_booking_status_changed(booking, previous_status: str) -> Notification | None:
    return notify(
        user=booking.patient,
        notification_type=Notification.Type.BOOKING_STATUS_CHANGED,
        title=f'Booking #{booking.id} updated',
        message=f'Status changed: {previous_status} → {booking.get_status_display()}.',
        link=f'/dashboard/patient',
    )


def notify_booking_cancelled_for_provider(booking) -> Notification | None:
    return notify(
        user=booking.provider.user,
        notification_type=Notification.Type.BOOKING_CANCELLED,
        title=f'Booking #{booking.id} was cancelled',
        message=f'Patient {booking.patient_name} cancelled their booking.',
        link=f'/dashboard/provider/bookings',
    )


def notify_new_booking_for_provider(booking) -> Notification | None:
    return notify(
        user=booking.provider.user,
        notification_type=Notification.Type.BOOKING_NEW,
        title=f'New booking from {booking.patient_name}',
        message=f'{booking.package.name} — {booking.appointment_date}',
        link=f'/dashboard/provider/bookings',
    )


def notify_provider_verified(provider) -> Notification | None:
    return notify(
        user=provider.user,
        notification_type=Notification.Type.PROVIDER_VERIFIED,
        title='Your provider profile is verified ✓',
        message='You can now publish packages and receive bookings.',
        link='/dashboard/provider',
    )


def notify_provider_rejected(provider, reason: str = '') -> Notification | None:
    return notify(
        user=provider.user,
        notification_type=Notification.Type.PROVIDER_REJECTED,
        title='Verification request not approved',
        message=reason or 'Please update your profile and resubmit.',
        link='/dashboard/provider/profile',
    )


def notify_payment_succeeded(payment) -> Notification | None:
    return notify(
        user=payment.user,
        notification_type=Notification.Type.PAYMENT_SUCCEEDED,
        title=f'Payment of {payment.amount} {payment.currency} succeeded',
        message=f'Booking #{payment.booking_id} is confirmed.',
        link='/dashboard/patient',
    )


def notify_payment_failed(payment) -> Notification | None:
    return notify(
        user=payment.user,
        notification_type=Notification.Type.PAYMENT_FAILED,
        title='Payment unsuccessful',
        message=payment.error_message or 'Please try a different card.',
        link='/dashboard/patient',
    )
