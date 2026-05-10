"""
StripePaymentProvider — skeleton ready for activation.

To enable in production:
1. pip install stripe
2. set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in env
3. set PAYMENT_PROVIDER=stripe
4. flesh out the methods below — the abstraction above means callers don't change.

Left intentionally unimplemented so it doesn't import the stripe SDK (which we
don't need for the demo). Importing this module without stripe installed is fine;
calls into it raise NotImplementedError.
"""

from __future__ import annotations

from decimal import Decimal

from .base import ChargeResult, CheckoutSession, PaymentProvider


class StripePaymentProvider(PaymentProvider):
    name = 'stripe'

    def __init__(self) -> None:
        # Lazy import: only fail if someone actually selects Stripe at runtime.
        try:
            import stripe as stripe_sdk  # noqa: F401
        except ImportError as exc:
            raise NotImplementedError(
                'StripePaymentProvider requires `pip install stripe`. '
                'For the demo use PAYMENT_PROVIDER=mock.'
            ) from exc

    def create_checkout_session(
        self,
        *,
        payment_token: str,
        amount: Decimal,
        currency: str,
        return_url: str,
        cancel_url: str,
    ) -> CheckoutSession:
        # TODO(production): stripe.checkout.Session.create(...)
        raise NotImplementedError('Stripe integration pending — use MockPaymentProvider for demo.')

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
        # TODO(production): stripe.PaymentIntent.create + confirm
        # In real Stripe flow, card data never touches our server — Stripe.js
        # tokenizes it client-side. This signature exists only so MockProvider
        # has a parallel surface for tests.
        raise NotImplementedError(
            'Stripe charges go through Elements/PaymentIntents, not this method. '
            'Real flow: client tokenizes → server confirms PaymentIntent.'
        )

    def refund(self, *, charge_id: str, amount: Decimal | None = None) -> ChargeResult:
        # TODO(production): stripe.Refund.create(charge=charge_id, amount=...)
        raise NotImplementedError('Stripe refund integration pending.')

    def verify_webhook(self, *, payload: bytes, signature: str) -> dict:
        # TODO(production): stripe.Webhook.construct_event(payload, signature, secret)
        raise NotImplementedError('Stripe webhook signature verification pending.')
