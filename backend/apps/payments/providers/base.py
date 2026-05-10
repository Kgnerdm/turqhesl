"""
PaymentProvider — abstraction over a payment gateway.

Concrete implementations:
- MockPaymentProvider (used for the demo and CI)
- StripePaymentProvider (skeleton, ready to activate)

Switching is controlled by the PAYMENT_PROVIDER environment variable.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class CheckoutSession:
    """What the frontend needs to complete the payment."""
    session_id: str
    checkout_url: str  # where to redirect the patient


@dataclass(frozen=True)
class ChargeResult:
    """Outcome of a charge attempt — what the provider returned."""
    succeeded: bool
    status: str            # one of Payment.Status values
    charge_id: str = ''    # provider-side reference
    error_code: str = ''
    error_message: str = ''
    card_last4: str = ''
    card_brand: str = ''


class PaymentProvider(ABC):
    """Common interface every payment backend must implement."""

    name: str  # short identifier ('mock', 'stripe', 'iyzico')

    @abstractmethod
    def create_checkout_session(
        self,
        *,
        payment_token: str,
        amount: Decimal,
        currency: str,
        return_url: str,
        cancel_url: str,
    ) -> CheckoutSession:
        """Tell the provider we want to collect `amount` from the patient.

        Returns a session_id (for reconciliation) and a checkout URL the
        frontend redirects the patient to.
        """
        ...

    @abstractmethod
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
        """Synchronous charge attempt. Real providers usually run this server-side
        after redirect; mocks run it inline from the checkout form post."""
        ...

    @abstractmethod
    def refund(self, *, charge_id: str, amount: Decimal | None = None) -> ChargeResult:
        """Issue a full or partial refund against a previously succeeded charge."""
        ...

    def verify_webhook(self, *, payload: bytes, signature: str) -> dict:
        """Parse and verify a webhook event. Default is a no-op for providers
        that don't push events (mock). Real providers must override."""
        import json
        return json.loads(payload or b'{}')
