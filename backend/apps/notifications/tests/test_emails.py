"""
Tests for transactional email tasks + the lifecycle hooks that fire them.

We run Celery in eager mode (synchronous) and use Django's locmem email
backend so we can assert against `mail.outbox` without hitting an SMTP server.
"""

from datetime import date, timedelta

import pytest
from django.core import mail
from django.urls import reverse
from rest_framework import status

from apps.bookings.models import Booking
from apps.notifications import tasks as notify_tasks
from apps.tests.factories import (
    BookingFactory,
    PackageFactory,
    PatientFactory,
    ProviderFactory,
    VerifiedProviderFactory,
)


pytestmark = pytest.mark.django_db


class TestBookingEmails:
    def test_booking_confirmed_email_sent(self):
        mail.outbox = []
        booking = BookingFactory()
        notify_tasks.send_booking_confirmed_email(booking.id)
        assert len(mail.outbox) == 1
        msg = mail.outbox[0]
        assert booking.patient_email in msg.to
        assert 'confirmed' in msg.subject.lower()
        assert booking.provider.business_name in msg.body

    def test_status_changed_email_includes_previous(self):
        mail.outbox = []
        booking = BookingFactory(status=Booking.Status.IN_PROGRESS)
        notify_tasks.send_booking_status_changed_email(booking.id, 'confirmed')
        assert len(mail.outbox) == 1
        assert 'confirmed' in mail.outbox[0].body.lower()

    def test_cancelled_email_to_both_parties(self):
        mail.outbox = []
        booking = BookingFactory()
        notify_tasks.send_booking_cancelled_email(booking.id)
        assert len(mail.outbox) == 1
        recipients = mail.outbox[0].to
        assert booking.patient_email in recipients
        assert booking.provider.user.email in recipients

    def test_missing_booking_does_not_send(self):
        mail.outbox = []
        notify_tasks.send_booking_confirmed_email(999999)
        assert mail.outbox == []


class TestProviderEmails:
    def test_verified_email(self):
        mail.outbox = []
        provider = VerifiedProviderFactory()
        notify_tasks.send_provider_verified_email(provider.id)
        assert len(mail.outbox) == 1
        assert provider.email in mail.outbox[0].to
        assert 'verif' in mail.outbox[0].subject.lower()

    def test_rejected_email_includes_reason(self):
        mail.outbox = []
        provider = ProviderFactory()
        notify_tasks.send_provider_rejected_email(provider.id, 'Missing license')
        assert len(mail.outbox) == 1
        assert 'Missing license' in mail.outbox[0].body


class TestPasswordResetEmail:
    def test_email_contains_reset_link(self):
        mail.outbox = []
        user = PatientFactory()
        notify_tasks.send_password_reset_email(user.id, 'abc.token123')
        assert len(mail.outbox) == 1
        assert user.email in mail.outbox[0].to
        # Token round-trips through context
        assert 'abc.token123' in mail.outbox[0].body


class TestBookingLifecycleHooks:
    """View-layer test: assert that the right Celery task is dispatched.

    The tasks themselves are tested above (TestBookingEmails) — here we just
    verify the wiring from view to task. Mocking `.delay` keeps this test
    focused and avoids hitting Django's template/context copy on Python 3.14.
    """

    def test_status_update_to_confirmed_dispatches_confirmed_email(
        self, api_client, mocker
    ):
        from rest_framework_simplejwt.tokens import RefreshToken
        booking = BookingFactory(status=Booking.Status.PENDING)
        token = RefreshToken.for_user(booking.provider.user).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        spy_confirmed = mocker.patch(
            'apps.notifications.tasks.send_booking_confirmed_email.delay'
        )
        spy_status = mocker.patch(
            'apps.notifications.tasks.send_booking_status_changed_email.delay'
        )

        url = reverse('bookings:booking-status-update', kwargs={'pk': booking.pk})
        resp = api_client.patch(url, {'status': 'confirmed'}, format='json')
        assert resp.status_code == status.HTTP_200_OK
        spy_confirmed.assert_called_once_with(booking.id)
        spy_status.assert_not_called()

    def test_status_update_other_transition_dispatches_status_email(
        self, api_client, mocker
    ):
        from rest_framework_simplejwt.tokens import RefreshToken
        booking = BookingFactory(status=Booking.Status.CONFIRMED)
        token = RefreshToken.for_user(booking.provider.user).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        spy = mocker.patch(
            'apps.notifications.tasks.send_booking_status_changed_email.delay'
        )
        url = reverse('bookings:booking-status-update', kwargs={'pk': booking.pk})
        resp = api_client.patch(url, {'status': 'in_progress'}, format='json')
        assert resp.status_code == status.HTTP_200_OK
        spy.assert_called_once_with(booking.id, 'confirmed')

    def test_cancel_dispatches_cancelled_email(self, patient_client, booking, mocker):
        spy = mocker.patch(
            'apps.notifications.tasks.send_booking_cancelled_email.delay'
        )
        url = reverse('bookings:booking-cancel', kwargs={'pk': booking.pk})
        resp = patient_client.post(
            url,
            {'cancellation_reason': 'Plans changed'},
            format='json',
        )
        assert resp.status_code == status.HTTP_200_OK
        spy.assert_called_once_with(booking.id)


class TestProviderVerifyHook:
    def test_verify_dispatches_email(self, admin_client, provider, mocker):
        spy = mocker.patch(
            'apps.notifications.tasks.send_provider_verified_email.delay'
        )
        url = reverse('providers:verify', kwargs={'pk': provider.pk})
        resp = admin_client.post(url, {'is_verified': True}, format='json')
        assert resp.status_code == status.HTTP_200_OK
        spy.assert_called_once_with(provider.id)

    def test_verify_no_email_if_already_verified(
        self, admin_client, verified_provider, mocker
    ):
        spy = mocker.patch(
            'apps.notifications.tasks.send_provider_verified_email.delay'
        )
        url = reverse('providers:verify', kwargs={'pk': verified_provider.pk})
        admin_client.post(url, {'is_verified': True}, format='json')
        spy.assert_not_called()

    def test_reject_dispatches_email_with_reason(
        self, admin_client, provider, mocker
    ):
        spy = mocker.patch(
            'apps.notifications.tasks.send_provider_rejected_email.delay'
        )
        url = reverse('providers:reject', kwargs={'pk': provider.pk})
        resp = admin_client.post(url, {'reason': 'Insufficient docs'}, format='json')
        assert resp.status_code == status.HTTP_200_OK
        spy.assert_called_once_with(provider.id, 'Insufficient docs')


class TestPasswordResetEndpoints:
    def test_request_dispatches_email_for_existing_user(self, api_client, mocker):
        spy = mocker.patch('apps.notifications.tasks.send_password_reset_email.delay')
        user = PatientFactory(email='alice@example.com')
        resp = api_client.post(
            reverse('users:password_reset'),
            {'email': 'alice@example.com'},
            format='json',
        )
        assert resp.status_code == status.HTTP_200_OK
        spy.assert_called_once()
        # First positional arg = user.id
        assert spy.call_args.args[0] == user.id

    def test_request_no_email_for_unknown_user(self, api_client, mocker):
        spy = mocker.patch('apps.notifications.tasks.send_password_reset_email.delay')
        resp = api_client.post(
            reverse('users:password_reset'),
            {'email': 'nobody@example.com'},
            format='json',
        )
        # Same 200 (anti-enumeration), but no email goes out
        assert resp.status_code == status.HTTP_200_OK
        spy.assert_not_called()

    def test_confirm_resets_password(self, api_client):
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode

        user = PatientFactory(password='OldPass123!')
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        full_token = f'{uid}.{token}'

        resp = api_client.post(
            reverse('users:password_reset_confirm'),
            {'token': full_token, 'new_password': 'BrandNewPass99'},
            format='json',
        )
        assert resp.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.check_password('BrandNewPass99')

    def test_confirm_rejects_bad_token(self, api_client):
        resp = api_client.post(
            reverse('users:password_reset_confirm'),
            {'token': 'garbage.token', 'new_password': 'BrandNewPass99'},
            format='json',
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
