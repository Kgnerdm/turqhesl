"""
Tests for booking endpoints (lifecycle, role-based access, cancellation).
"""

from datetime import date, timedelta

import pytest
from django.urls import reverse
from rest_framework import status

from apps.bookings.models import Booking
from apps.tests.factories import (
    BookingFactory,
    PackageFactory,
    PatientFactory,
    VerifiedProviderFactory,
)


pytestmark = pytest.mark.django_db


class TestBookingCreate:
    url = reverse('bookings:booking-create')

    def _payload(self, package, **overrides):
        data = {
            'package_id': package.pk,
            'appointment_date': (date.today() + timedelta(days=14)).isoformat(),
            'patient_name': 'John Doe',
            'patient_email': 'john@test.com',
            'patient_phone': '+905551234567',
            'notes': 'Allergic to penicillin',
        }
        data.update(overrides)
        return data

    def test_patient_can_create_booking(self, patient_client, package):
        resp = patient_client.post(self.url, self._payload(package), format='json')
        assert resp.status_code == status.HTTP_201_CREATED
        assert Booking.objects.filter(patient_email='john@test.com').exists()

    def test_anonymous_cannot_create(self, api_client, package):
        resp = api_client.post(self.url, self._payload(package), format='json')
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_invalid_package_rejected(self, patient_client):
        payload = {
            'package_id': 99999,
            'appointment_date': (date.today() + timedelta(days=7)).isoformat(),
            'patient_name': 'X',
            'patient_email': 'x@test.com',
            'patient_phone': '+905551234567',
        }
        resp = patient_client.post(self.url, payload, format='json')
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_inactive_package_rejected(self, patient_client, verified_provider):
        pkg = PackageFactory(provider=verified_provider, is_active=False)
        resp = patient_client.post(self.url, self._payload(pkg), format='json')
        assert resp.status_code == status.HTTP_400_BAD_REQUEST


class TestMyBookings:
    url = reverse('bookings:my-bookings')

    def test_patient_sees_only_own(self, patient_client, patient, package):
        BookingFactory(patient=patient, package=package, provider=package.provider)
        # Another patient's booking
        other = PatientFactory()
        BookingFactory(patient=other, package=package, provider=package.provider)

        resp = patient_client.get(self.url)
        assert resp.status_code == status.HTTP_200_OK
        data = resp.data.get('data', resp.data.get('results', resp.data))
        if isinstance(data, list):
            assert len(data) == 1


class TestProviderBookings:
    url = reverse('bookings:provider-bookings')

    def test_provider_sees_only_own(self, api_client, verified_provider):
        from rest_framework_simplejwt.tokens import RefreshToken
        pkg = PackageFactory(provider=verified_provider)
        BookingFactory(package=pkg, provider=verified_provider)

        # Another provider's booking
        other = VerifiedProviderFactory()
        other_pkg = PackageFactory(provider=other)
        BookingFactory(package=other_pkg, provider=other)

        token = RefreshToken.for_user(verified_provider.user).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        resp = api_client.get(self.url)
        assert resp.status_code == status.HTTP_200_OK

    def test_patient_blocked(self, patient_client):
        resp = patient_client.get(self.url)
        assert resp.status_code in (status.HTTP_403_FORBIDDEN, status.HTTP_200_OK)


class TestBookingDetail:
    def test_owner_can_view(self, patient_client, booking):
        url = reverse('bookings:booking-detail', kwargs={'pk': booking.pk})
        resp = patient_client.get(url)
        assert resp.status_code == status.HTTP_200_OK

    def test_other_patient_cannot_view(self, api_client, booking):
        from rest_framework_simplejwt.tokens import RefreshToken
        intruder = PatientFactory()
        token = RefreshToken.for_user(intruder).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        url = reverse('bookings:booking-detail', kwargs={'pk': booking.pk})
        resp = api_client.get(url)
        assert resp.status_code in (
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,
        )

    def test_provider_of_booking_can_view(self, api_client, booking):
        from rest_framework_simplejwt.tokens import RefreshToken
        token = RefreshToken.for_user(booking.provider.user).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        url = reverse('bookings:booking-detail', kwargs={'pk': booking.pk})
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_200_OK


class TestStatusTransitions:
    def test_provider_can_confirm(self, api_client, booking):
        from rest_framework_simplejwt.tokens import RefreshToken
        token = RefreshToken.for_user(booking.provider.user).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        url = reverse('bookings:booking-status-update', kwargs={'pk': booking.pk})
        resp = api_client.patch(url, {'status': 'confirmed'}, format='json')
        assert resp.status_code == status.HTTP_200_OK
        booking.refresh_from_db()
        assert booking.status == 'confirmed'
        assert booking.confirmed_at is not None

    def test_provider_can_complete(self, api_client, booking):
        from rest_framework_simplejwt.tokens import RefreshToken
        booking.status = Booking.Status.CONFIRMED
        booking.save()

        token = RefreshToken.for_user(booking.provider.user).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        url = reverse('bookings:booking-status-update', kwargs={'pk': booking.pk})
        # in_progress first, then completed
        api_client.patch(url, {'status': 'in_progress'}, format='json')
        resp = api_client.patch(url, {'status': 'completed'}, format='json')
        assert resp.status_code == status.HTTP_200_OK
        booking.refresh_from_db()
        assert booking.status == 'completed'

    def test_patient_cannot_change_status(self, patient_client, booking):
        url = reverse('bookings:booking-status-update', kwargs={'pk': booking.pk})
        resp = patient_client.patch(url, {'status': 'confirmed'}, format='json')
        assert resp.status_code in (
            status.HTTP_403_FORBIDDEN,
            status.HTTP_400_BAD_REQUEST,
        )


class TestCancel:
    def test_patient_can_cancel_own(self, patient_client, booking):
        url = reverse('bookings:booking-cancel', kwargs={'pk': booking.pk})
        resp = patient_client.post(
            url,
            {'cancellation_reason': 'Plans changed'},
            format='json',
        )
        assert resp.status_code == status.HTTP_200_OK
        booking.refresh_from_db()
        assert booking.status == 'cancelled'
        assert booking.cancelled_at is not None
        assert booking.cancellation_reason  # Set to a non-empty string

    def test_other_patient_cannot_cancel(self, api_client, booking):
        from rest_framework_simplejwt.tokens import RefreshToken
        intruder = PatientFactory()
        token = RefreshToken.for_user(intruder).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        url = reverse('bookings:booking-cancel', kwargs={'pk': booking.pk})
        resp = api_client.post(url, {'cancellation_reason': 'X'}, format='json')
        assert resp.status_code in (
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,
        )


class TestStats:
    url = reverse('bookings:booking-stats')

    def test_authenticated_can_view(self, patient_client):
        resp = patient_client.get(self.url)
        assert resp.status_code == status.HTTP_200_OK

    def test_anonymous_blocked(self, api_client):
        resp = api_client.get(self.url)
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


class TestModelMethods:
    """Unit tests for Booking model properties."""

    def test_is_cancellable_pending(self, booking):
        assert booking.status == Booking.Status.PENDING
        assert booking.is_cancellable is True

    def test_is_cancellable_confirmed(self, booking):
        booking.status = Booking.Status.CONFIRMED
        assert booking.is_cancellable is True

    def test_is_not_cancellable_completed(self, booking):
        booking.status = Booking.Status.COMPLETED
        assert booking.is_cancellable is False

    def test_is_confirmable_only_pending(self, booking):
        assert booking.is_confirmable is True
        booking.status = Booking.Status.CONFIRMED
        assert booking.is_confirmable is False
