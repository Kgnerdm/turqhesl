"""
Provider selection — driven by the PAYMENT_PROVIDER setting.

Default is 'mock'. Production deployments set PAYMENT_PROVIDER=stripe.
"""

from __future__ import annotations

from django.conf import settings

from .base import ChargeResult, CheckoutSession, PaymentProvider
from .mock import MockPaymentProvider
from .stripe import StripePaymentProvider


_REGISTRY: dict[str, type[PaymentProvider]] = {
    'mock': MockPaymentProvider,
    'stripe': StripePaymentProvider,
}


def get_provider(name: str | None = None) -> PaymentProvider:
    """Return an instance of the configured payment provider."""
    selected = (name or getattr(settings, 'PAYMENT_PROVIDER', 'mock')).lower()
    cls = _REGISTRY.get(selected)
    if cls is None:
        raise ValueError(
            f'Unknown PAYMENT_PROVIDER {selected!r}. '
            f'Valid values: {sorted(_REGISTRY)}'
        )
    return cls()


__all__ = [
    'PaymentProvider',
    'CheckoutSession',
    'ChargeResult',
    'MockPaymentProvider',
    'StripePaymentProvider',
    'get_provider',
]
