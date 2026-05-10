"""
MockPaymentProvider — local sandbox, no network calls, no real money.

Card numbers map to deterministic outcomes. We use the same conventions as
Stripe's test cards so the demo feels familiar to anyone who's seen Stripe
test mode before.
"""

from __future__ import annotations

import secrets
from decimal import Decimal

from .base import ChargeResult, CheckoutSession, PaymentProvider
from ..models import Payment


# Stripe-compatible test card outcomes. Match by full card number.
TEST_CARDS = {
    '4242424242424242': ('succeeded', '', '', 'visa'),
    '4000000000000002': ('declined', 'card_declined',
                         'Your card was declined.', 'visa'),
    '4000000000009995': ('insufficient_funds', 'insufficient_funds',
                         'Your card has insufficient funds.', 'visa'),
}


def _normalize(card_number: str) -> str:
    """Strip spaces/dashes from the user's input."""
    return ''.join(c for c in (card_number or '') if c.isdigit())


def _detect_brand(card_number: str) -> str:
    n = _normalize(card_number)
    if not n:
        return ''
    if n.startswith('4'):
        return 'visa'
    if n.startswith(('5', '2')):
        return 'mastercard'
    if n.startswith(('34', '37')):
        return 'amex'
    return 'card'


class MockPaymentProvider(PaymentProvider):
    name = 'mock'

    def create_checkout_session(
        self,
        *,
        payment_token: str,
        amount: Decimal,
        currency: str,
        return_url: str,
        cancel_url: str,
    ) -> CheckoutSession:
        # Frontend hosts the mock checkout page; we just hand back the URL.
        session_id = f'mock_sess_{secrets.token_hex(8)}'
        # The frontend route is /payments/checkout/<token>
        # but we store it absolutely so the caller can redirect directly.
        return CheckoutSession(
            session_id=session_id,
            checkout_url=f'/payments/checkout/{payment_token}',
        )

    def charge(
        self,
        *,
        amount: Decimal,
        currency: str,
        card_number: str,
        card_exp_month: str,
        card_exp_year: str,
        card_cvc: str,
    ) -> ChargeResult:
        normalized = _normalize(card_number)
        last4 = normalized[-4:] if len(normalized) >= 4 else ''
        brand = _detect_brand(normalized)

        outcome = TEST_CARDS.get(normalized)
        if outcome is None:
            # Any other card number → generic decline (lets us test "unknown card")
            return ChargeResult(
                succeeded=False,
                status=Payment.Status.DECLINED,
                error_code='card_declined',
                error_message='Card declined. In demo mode, use a known test card.',
                card_last4=last4,
                card_brand=brand or 'card',
            )

        status_label, error_code, error_message, brand_override = outcome

        if status_label == 'succeeded':
            return ChargeResult(
                succeeded=True,
                status=Payment.Status.SUCCEEDED,
                charge_id=f'mock_ch_{secrets.token_hex(10)}',
                card_last4=last4,
                card_brand=brand_override or brand,
            )

        # Failure mapping
        status_value = {
            'declined': Payment.Status.DECLINED,
            'insufficient_funds': Payment.Status.INSUFFICIENT_FUNDS,
        }.get(status_label, Payment.Status.FAILED)

        return ChargeResult(
            succeeded=False,
            status=status_value,
            error_code=error_code,
            error_message=error_message,
            card_last4=last4,
            card_brand=brand_override or brand,
        )

    def refund(
        self,
        *,
        charge_id: str,
        amount: Decimal | None = None,
    ) -> ChargeResult:
        # In the mock world, refunds always succeed.
        return ChargeResult(
            succeeded=True,
            status=Payment.Status.REFUNDED,
            charge_id=f'mock_re_{secrets.token_hex(10)}',
        )
