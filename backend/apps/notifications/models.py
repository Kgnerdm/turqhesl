"""
In-app notification model.

Separate from email notifications: this is what the bell icon in the
header reads from. The notification *content* mirrors what we send via
email (booking confirmed, provider verified, etc.) — but persists per-user
so the UI can show unread badges and a dropdown list.
"""

from __future__ import annotations

from django.conf import settings
from django.db import models


class Notification(models.Model):
    """A single in-app notification targeted at one user."""

    class Type(models.TextChoices):
        BOOKING_CONFIRMED = 'booking_confirmed', 'Booking confirmed'
        BOOKING_STATUS_CHANGED = 'booking_status_changed', 'Booking status changed'
        BOOKING_CANCELLED = 'booking_cancelled', 'Booking cancelled'
        BOOKING_NEW = 'booking_new', 'New booking received'
        PROVIDER_VERIFIED = 'provider_verified', 'Provider verified'
        PROVIDER_REJECTED = 'provider_rejected', 'Provider rejected'
        PAYMENT_SUCCEEDED = 'payment_succeeded', 'Payment succeeded'
        PAYMENT_FAILED = 'payment_failed', 'Payment failed'
        SYSTEM = 'system', 'System message'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    notification_type = models.CharField(
        max_length=40,
        choices=Type.choices,
        default=Type.SYSTEM,
    )
    title = models.CharField(max_length=200)
    message = models.TextField(blank=True, default='')
    # Optional deep-link the frontend can route to when the user clicks
    link = models.CharField(max_length=300, blank=True, default='')

    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', '-created_at']),
        ]

    def __str__(self) -> str:
        return f'#{self.pk} → {self.user.email}: {self.title}'

    def mark_read(self) -> None:
        from django.utils import timezone
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
