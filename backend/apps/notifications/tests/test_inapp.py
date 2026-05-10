"""
Tests for the in-app notification model + endpoints + lifecycle wiring.
"""

from __future__ import annotations

import pytest
from django.urls import reverse
from rest_framework import status

from apps.bookings.models import Booking
from apps.notifications import services as notif_services
from apps.notifications.models import Notification
from apps.tests.factories import (
    BookingFactory,
    PatientFactory,
    ProviderFactory,
    VerifiedProviderFactory,
)


pytestmark = pytest.mark.django_db


class TestNotificationModel:
    def test_creation(self, patient):
        n = notif_services.notify(
            user=patient,
            notification_type=Notification.Type.SYSTEM,
            title='hello',
            message='world',
        )
        assert n is not None
        assert n.is_read is False
        assert n.user == patient

    def test_mark_read_sets_timestamp(self, patient):
        n = notif_services.notify(
            user=patient,
            notification_type=Notification.Type.SYSTEM,
            title='x',
        )
        assert n.read_at is None
        n.mark_read()
        n.refresh_from_db()
        assert n.is_read is True
        assert n.read_at is not None

    def test_notify_with_no_user_returns_none(self):
        assert notif_services.notify(
            user=None,
            notification_type=Notification.Type.SYSTEM,
            title='x',
        ) is None


class TestNotificationListEndpoint:
    url = reverse('notifications:list')

    def test_authenticated_lists_own_notifications(self, patient_client, patient):
        notif_services.notify(user=patient, notification_type='system', title='one')
        notif_services.notify(user=patient, notification_type='system', title='two')
        # Another user — should not appear in this list
        other = PatientFactory()
        notif_services.notify(user=other, notification_type='system', title='other')

        resp = patient_client.get(self.url)
        assert resp.status_code == status.HTTP_200_OK
        titles = [n['title'] for n in resp.data['data']]
        assert 'one' in titles and 'two' in titles
        assert 'other' not in titles
        assert resp.data['unread_count'] == 2

    def test_unread_filter(self, patient_client, patient):
        n1 = notif_services.notify(user=patient, notification_type='system', title='unread')
        n2 = notif_services.notify(user=patient, notification_type='system', title='read')
        n2.mark_read()

        resp = patient_client.get(self.url, {'unread': 'true'})
        titles = [n['title'] for n in resp.data['data']]
        assert 'unread' in titles
        assert 'read' not in titles

    def test_anonymous_blocked(self, api_client):
        resp = api_client.get(self.url)
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


class TestMarkRead:
    def test_owner_can_mark_read(self, patient_client, patient):
        n = notif_services.notify(user=patient, notification_type='system', title='x')
        url = reverse('notifications:mark-read', kwargs={'pk': n.pk})
        resp = patient_client.post(url)
        assert resp.status_code == status.HTTP_200_OK
        n.refresh_from_db()
        assert n.is_read is True

    def test_other_user_cannot_mark_read(self, api_client, patient):
        from rest_framework_simplejwt.tokens import RefreshToken
        n = notif_services.notify(user=patient, notification_type='system', title='x')
        intruder = PatientFactory()
        token = RefreshToken.for_user(intruder).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        url = reverse('notifications:mark-read', kwargs={'pk': n.pk})
        resp = api_client.post(url)
        assert resp.status_code == status.HTTP_404_NOT_FOUND


class TestMarkAllRead:
    url = reverse('notifications:mark-all-read')

    def test_marks_all_unread(self, patient_client, patient):
        for i in range(3):
            notif_services.notify(user=patient, notification_type='system', title=f't{i}')
        resp = patient_client.post(self.url)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data['marked_read'] == 3
        assert Notification.objects.filter(user=patient, is_read=False).count() == 0


class TestUnreadCount:
    url = reverse('notifications:unread-count')

    def test_returns_count(self, patient_client, patient):
        notif_services.notify(user=patient, notification_type='system', title='x')
        notif_services.notify(user=patient, notification_type='system', title='y')
        resp = patient_client.get(self.url)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data['unread_count'] == 2


class TestLifecycleWiring:
    """End-to-end: hitting an API endpoint creates an in-app notification."""

    def test_booking_create_notifies_provider(self, patient_client, package):
        from datetime import date, timedelta
        url = reverse('bookings:booking-create')
        resp = patient_client.post(
            url,
            {
                'package_id': package.id,
                'appointment_date': (date.today() + timedelta(days=14)).isoformat(),
                'patient_name': 'X',
                'patient_email': 'x@test.com',
                'patient_phone': '+905551234567',
            },
            format='json',
        )
        assert resp.status_code == status.HTTP_201_CREATED
        # Provider should have a notification
        notifs = Notification.objects.filter(
            user=package.provider.user,
            notification_type=Notification.Type.BOOKING_NEW,
        )
        assert notifs.count() == 1

    def test_status_update_to_confirmed_notifies_patient(self, api_client, mocker):
        from rest_framework_simplejwt.tokens import RefreshToken
        booking = BookingFactory(status=Booking.Status.PENDING)
        # Suppress Celery email task — we only care about in-app notification
        mocker.patch('apps.notifications.tasks.send_booking_confirmed_email.delay')
        token = RefreshToken.for_user(booking.provider.user).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        url = reverse('bookings:booking-status-update', kwargs={'pk': booking.pk})
        resp = api_client.patch(url, {'status': 'confirmed'}, format='json')
        assert resp.status_code == status.HTTP_200_OK
        notifs = Notification.objects.filter(
            user=booking.patient,
            notification_type=Notification.Type.BOOKING_CONFIRMED,
        )
        assert notifs.count() == 1

    def test_provider_verify_creates_notification(self, admin_client, provider, mocker):
        mocker.patch('apps.notifications.tasks.send_provider_verified_email.delay')
        url = reverse('providers:verify', kwargs={'pk': provider.pk})
        resp = admin_client.post(url, {'is_verified': True}, format='json')
        assert resp.status_code == status.HTTP_200_OK
        notifs = Notification.objects.filter(
            user=provider.user,
            notification_type=Notification.Type.PROVIDER_VERIFIED,
        )
        assert notifs.count() == 1
