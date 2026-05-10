"""
Payment model.

A booking can have multiple payment attempts (decline + retry).
Only one payment per booking ends up in SUCCEEDED state.
"""

from __future__ import annotations

import secrets

from django.conf import settings
from django.db import models
from django.utils import timezone


def generate_token() -> str:
    """24-byte URL-safe token used as the public reference for a payment session."""
    return secrets.token_urlsafe(24)


class Payment(models.Model):
    """
    A single payment attempt for a booking.

    Lifecycle:
        PENDING  → PROCESSING → SUCCEEDED ✓
                              → DECLINED        (try again with another card)
                              → INSUFFICIENT_FUNDS
                              → FAILED          (other errors)
                 → CANCELLED                    (user clicked cancel)
                 → REFUNDED                     (admin issued refund post-success)
    """

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        SUCCEEDED = 'succeeded', 'Succeeded'
        DECLINED = 'declined', 'Declined'
        INSUFFICIENT_FUNDS = 'insufficient_funds', 'Insufficient Funds'
        FAILED = 'failed', 'Failed'
        CANCELLED = 'cancelled', 'Cancelled'
        REFUNDED = 'refunded', 'Refunded'

    class Provider(models.TextChoices):
        MOCK = 'mock', 'Mock (sandbox)'
        STRIPE = 'stripe', 'Stripe'
        IYZICO = 'iyzico', 'Iyzico'

    # Relationships
    booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.CASCADE,
        related_name='payments',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='payments',
        help_text='Who initiated the payment (usually the patient).',
    )

    # Public reference — used in URLs (mock checkout link), never expose pk
    token = models.CharField(
        max_length=64,
        unique=True,
        default=generate_token,
        editable=False,
        db_index=True,
    )

    # Money snapshot — never read live from booking, frozen at initiation
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')

    # Status
    status = models.CharField(
        max_length=24,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    provider = models.CharField(
        max_length=16,
        choices=Provider.choices,
        default=Provider.MOCK,
    )

    # Provider-side identifiers (for reconciliation and idempotency)
    provider_session_id = models.CharField(max_length=255, blank=True, default='')
    provider_charge_id = models.CharField(max_length=255, blank=True, default='')

    # Card snapshot — never store full card number; last 4 only for display
    card_last4 = models.CharField(max_length=4, blank=True, default='')
    card_brand = models.CharField(max_length=20, blank=True, default='')

    # Failure tracking
    error_code = models.CharField(max_length=64, blank=True, default='')
    error_message = models.TextField(blank=True, default='')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    succeeded_at = models.DateTimeField(null=True, blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['booking', 'status']),
            models.Index(fields=['provider_session_id']),
        ]

    def __str__(self) -> str:
        return f'Payment #{self.id} ({self.status}) for Booking #{self.booking_id}'

    # ----- State transitions -----

    def mark_succeeded(self, *, charge_id: str = '') -> None:
        self.status = self.Status.SUCCEEDED
        self.succeeded_at = timezone.now()
        if charge_id:
            self.provider_charge_id = charge_id
        self.save(update_fields=[
            'status', 'succeeded_at', 'provider_charge_id', 'updated_at',
        ])

    def mark_failed(self, *, status: str, code: str = '', message: str = '') -> None:
        self.status = status
        self.error_code = code
        self.error_message = message
        self.save(update_fields=[
            'status', 'error_code', 'error_message', 'updated_at',
        ])

    def mark_refunded(self) -> None:
        self.status = self.Status.REFUNDED
        self.refunded_at = timezone.now()
        self.save(update_fields=['status', 'refunded_at', 'updated_at'])

    @property
    def is_terminal(self) -> bool:
        """True if this payment cannot transition further on its own."""
        return self.status in {
            self.Status.SUCCEEDED,
            self.Status.CANCELLED,
            self.Status.REFUNDED,
            self.Status.FAILED,
        }
