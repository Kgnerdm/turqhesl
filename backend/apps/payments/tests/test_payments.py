"""
Tests for the payment flow.

We test:
- Initiating a payment for a booking
- Charging with the three Stripe-style test cards (success / declined /
  insufficient_funds)
- Booking promotion to 'confirmed' on success + email dispatch
- Idempotency: a terminal payment cannot be processed again
- Permission boundaries
"""

import pytest
from decimal import Decimal
from django.urls import reverse
from rest_framework import status

from apps.bookings.models import Booking
from apps.payments.models import Payment
from apps.tests.factories import (
    BookingFactory,
    PatientFactory,
)


pytestmark = pytest.mark.django_db


# Card numbers from MockPaymentProvider
SUCCESS_CARD = '4242 4242 4242 4242'
DECLINED_CARD = '4000 0000 0000 0002'
INSUFFICIENT_CARD = '4000 0000 0000 9995'
UNKNOWN_CARD = '5555 5555 5555 4444'


def _card_payload(card: str) -> dict:
    return {
        'card_number': card,
        'card_exp_month': '12',
        'card_exp_year': '2030',
        'card_cvc': '123',
        'cardholder_name': 'Test User',
    }


class TestInitiate:
    url = reverse('payments:initiate')

    def test_patient_can_initiate(self, patient_client, booking):
        resp = patient_client.post(
            self.url, {'booking_id': booking.id}, format='json',
        )
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data['payment']['status'] == 'pending'
        assert resp.data['payment']['amount'] == str(booking.total_price)
        assert '/payments/checkout/' in resp.data['checkout_url']

    def test_other_patient_blocked(self, api_client, booking):
        from rest_framework_simplejwt.tokens import RefreshToken
        intruder = PatientFactory()
        token = RefreshToken.for_user(intruder).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        resp = api_client.post(
            reverse('payments:initiate'),
            {'booking_id': booking.id},
            format='json',
        )
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_already_paid_returns_409(self, patient_client, booking):
        booking.payment_status = Booking.PaymentStatus.PAID
        booking.save()
        resp = patient_client.post(
            self.url, {'booking_id': booking.id}, format='json',
        )
        assert resp.status_code == status.HTTP_409_CONFLICT

    def test_anonymous_blocked(self, api_client, booking):
        resp = api_client.post(
            self.url, {'booking_id': booking.id}, format='json',
        )
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_reuses_pending_payment(self, patient_client, booking):
        # First call creates the payment
        first = patient_client.post(self.url, {'booking_id': booking.id}, format='json')
        # Second call must return the same payment, not a new one
        second = patient_client.post(self.url, {'booking_id': booking.id}, format='json')
        assert first.data['payment']['id'] == second.data['payment']['id']
        assert booking.payments.count() == 1


class TestPaymentDetail:
    def test_returns_amount_and_booking_summary(self, patient_client, booking):
        # Initiate first
        init = patient_client.post(
            reverse('payments:initiate'),
            {'booking_id': booking.id},
            format='json',
        )
        token = init.data['payment']['token']

        resp = patient_client.get(reverse('payments:detail', kwargs={'token': token}))
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data['payment']['token'] == token
        assert resp.data['booking']['package_name'] == booking.package.name


class TestProcessSuccess:
    def test_success_card_charges_and_confirms_booking(
        self, patient_client, booking, mocker
    ):
        spy = mocker.patch('apps.notifications.tasks.send_booking_confirmed_email.delay')
        init = patient_client.post(
            reverse('payments:initiate'),
            {'booking_id': booking.id},
            format='json',
        )
        token = init.data['payment']['token']

        resp = patient_client.post(
            reverse('payments:process', kwargs={'token': token}),
            _card_payload(SUCCESS_CARD),
            format='json',
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data['succeeded'] is True
        assert resp.data['payment']['status'] == 'succeeded'
        assert resp.data['payment']['card_last4'] == '4242'

        booking.refresh_from_db()
        assert booking.payment_status == 'paid'
        assert booking.status == 'confirmed'
        assert booking.confirmed_at is not None
        spy.assert_called_once_with(booking.id)


class TestProcessDeclined:
    def test_declined_card_keeps_booking_pending(self, patient_client, booking, mocker):
        spy = mocker.patch('apps.notifications.tasks.send_booking_confirmed_email.delay')
        init = patient_client.post(
            reverse('payments:initiate'),
            {'booking_id': booking.id},
            format='json',
        )
        token = init.data['payment']['token']

        resp = patient_client.post(
            reverse('payments:process', kwargs={'token': token}),
            _card_payload(DECLINED_CARD),
            format='json',
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data['succeeded'] is False
        assert resp.data['payment']['status'] == 'declined'
        assert resp.data['payment']['error_code'] == 'card_declined'

        booking.refresh_from_db()
        assert booking.payment_status == 'pending'
        assert booking.status == 'pending'
        spy.assert_not_called()


class TestProcessInsufficient:
    def test_insufficient_funds_distinguishable_from_declined(
        self, patient_client, booking
    ):
        init = patient_client.post(
            reverse('payments:initiate'),
            {'booking_id': booking.id},
            format='json',
        )
        token = init.data['payment']['token']

        resp = patient_client.post(
            reverse('payments:process', kwargs={'token': token}),
            _card_payload(INSUFFICIENT_CARD),
            format='json',
        )
        assert resp.data['payment']['status'] == 'insufficient_funds'
        assert resp.data['payment']['error_code'] == 'insufficient_funds'


class TestProcessUnknownCard:
    def test_unknown_card_is_declined(self, patient_client, booking):
        init = patient_client.post(
            reverse('payments:initiate'),
            {'booking_id': booking.id},
            format='json',
        )
        token = init.data['payment']['token']

        resp = patient_client.post(
            reverse('payments:process', kwargs={'token': token}),
            _card_payload(UNKNOWN_CARD),
            format='json',
        )
        assert resp.data['succeeded'] is False
        assert resp.data['payment']['status'] == 'declined'


class TestRetryAfterDecline:
    def test_can_retry_after_decline_with_new_payment(self, patient_client, booking):
        # First attempt: declined
        first_init = patient_client.post(
            reverse('payments:initiate'),
            {'booking_id': booking.id},
            format='json',
        )
        first_token = first_init.data['payment']['token']
        patient_client.post(
            reverse('payments:process', kwargs={'token': first_token}),
            _card_payload(DECLINED_CARD),
            format='json',
        )

        # Second initiate creates a fresh payment (the old one is terminal)
        second_init = patient_client.post(
            reverse('payments:initiate'),
            {'booking_id': booking.id},
            format='json',
        )
        assert second_init.status_code == status.HTTP_201_CREATED
        assert second_init.data['payment']['id'] != first_init.data['payment']['id']

        second_token = second_init.data['payment']['token']
        resp = patient_client.post(
            reverse('payments:process', kwargs={'token': second_token}),
            _card_payload(SUCCESS_CARD),
            format='json',
        )
        assert resp.data['succeeded'] is True


class TestIdempotency:
    def test_terminal_payment_cannot_be_processed_again(self, patient_client, booking):
        init = patient_client.post(
            reverse('payments:initiate'),
            {'booking_id': booking.id},
            format='json',
        )
        token = init.data['payment']['token']
        # First charge: success
        patient_client.post(
            reverse('payments:process', kwargs={'token': token}),
            _card_payload(SUCCESS_CARD),
            format='json',
        )
        # Second attempt: 409
        resp = patient_client.post(
            reverse('payments:process', kwargs={'token': token}),
            _card_payload(SUCCESS_CARD),
            format='json',
        )
        assert resp.status_code == status.HTTP_409_CONFLICT


class TestProviderFactory:
    def test_default_provider_is_mock(self, settings):
        from apps.payments.providers import get_provider, MockPaymentProvider
        settings.PAYMENT_PROVIDER = 'mock'
        assert isinstance(get_provider(), MockPaymentProvider)

    def test_unknown_provider_raises(self, settings):
        from apps.payments.providers import get_provider
        settings.PAYMENT_PROVIDER = 'paypal'
        with pytest.raises(ValueError):
            get_provider()


class TestStripeWebhookSkeleton:
    def test_returns_501_when_stripe_not_configured(self, api_client):
        resp = api_client.post(
            reverse('payments:webhook-stripe'),
            data='{}',
            content_type='application/json',
        )
        assert resp.status_code == status.HTTP_501_NOT_IMPLEMENTED
