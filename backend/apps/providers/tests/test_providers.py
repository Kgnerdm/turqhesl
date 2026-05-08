"""
Tests for provider endpoints (CRUD, list, verification flow, stats).

API uses snake_case keys in both request and response bodies.
"""

import pytest
from django.urls import reverse
from rest_framework import status

from apps.tests.factories import (
    ProviderFactory,
    ProviderUserFactory,
    VerifiedProviderFactory,
)


pytestmark = pytest.mark.django_db


class TestProviderListPublic:
    url = reverse('providers:list')

    def test_anyone_can_list(self, api_client):
        VerifiedProviderFactory()
        VerifiedProviderFactory()
        resp = api_client.get(self.url)
        assert resp.status_code == status.HTTP_200_OK
        assert 'data' in resp.data
        assert len(resp.data['data']) >= 2

    def test_filter_by_city(self, api_client):
        VerifiedProviderFactory(city='Istanbul')
        VerifiedProviderFactory(city='Ankara')
        resp = api_client.get(self.url, {'city': 'Istanbul'})
        assert resp.status_code == status.HTTP_200_OK
        for p in resp.data['data']:
            assert p['city'] == 'Istanbul'

    def test_filter_verified_only(self, api_client):
        VerifiedProviderFactory()
        ProviderFactory(is_verified=False)
        resp = api_client.get(self.url, {'is_verified': 'true'})
        assert resp.status_code == status.HTTP_200_OK
        for p in resp.data['data']:
            assert p['is_verified'] is True


class TestProviderDetail:
    def test_anyone_can_view(self, api_client, verified_provider):
        url = reverse('providers:detail', kwargs={'pk': verified_provider.pk})
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data['business_name'] == verified_provider.business_name

    def test_404_for_missing(self, api_client):
        url = reverse('providers:detail', kwargs={'pk': 99999})
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_404_NOT_FOUND


class TestMyProvider:
    url = reverse('providers:me')

    def test_provider_can_view_own(self, provider_client, provider):
        resp = provider_client.get(self.url)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data['business_name'] == provider.business_name

    def test_anonymous_rejected(self, api_client):
        resp = api_client.get(self.url)
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_non_provider_rejected(self, patient_client):
        resp = patient_client.get(self.url)
        assert resp.status_code == status.HTTP_403_FORBIDDEN


class TestProviderUpdate:
    def test_owner_can_update(self, provider_client, provider):
        url = reverse('providers:update', kwargs={'pk': provider.pk})
        resp = provider_client.patch(
            url,
            {'business_name': 'Updated Name', 'description': 'New description'},
            format='json',
        )
        assert resp.status_code == status.HTTP_200_OK
        provider.refresh_from_db()
        assert provider.business_name == 'Updated Name'

    def test_other_provider_cannot_update(self, api_client, provider):
        from rest_framework_simplejwt.tokens import RefreshToken
        intruder = ProviderUserFactory()
        ProviderFactory(user=intruder)
        token = RefreshToken.for_user(intruder).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        url = reverse('providers:update', kwargs={'pk': provider.pk})
        resp = api_client.patch(url, {'business_name': 'Hijacked'}, format='json')
        assert resp.status_code in (
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,
        )
        provider.refresh_from_db()
        assert provider.business_name != 'Hijacked'

    def test_anonymous_cannot_update(self, api_client, provider):
        url = reverse('providers:update', kwargs={'pk': provider.pk})
        resp = api_client.patch(url, {'business_name': 'Hijacked'}, format='json')
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


class TestVerificationFlow:
    def test_admin_can_verify(self, admin_client, provider):
        assert provider.is_verified is False
        url = reverse('providers:verify', kwargs={'pk': provider.pk})
        resp = admin_client.post(url, {'is_verified': True}, format='json')
        assert resp.status_code == status.HTTP_200_OK
        provider.refresh_from_db()
        assert provider.is_verified is True
        assert provider.verification_date is not None

    def test_admin_can_unverify(self, admin_client, verified_provider):
        url = reverse('providers:verify', kwargs={'pk': verified_provider.pk})
        resp = admin_client.post(url, {'is_verified': False}, format='json')
        assert resp.status_code == status.HTTP_200_OK
        verified_provider.refresh_from_db()
        assert verified_provider.is_verified is False
        assert verified_provider.verification_date is None

    def test_non_admin_cannot_verify(self, provider_client, verified_provider):
        url = reverse('providers:verify', kwargs={'pk': verified_provider.pk})
        resp = provider_client.post(url, {'is_verified': True}, format='json')
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_can_reject(self, admin_client, provider):
        url = reverse('providers:reject', kwargs={'pk': provider.pk})
        resp = admin_client.post(
            url,
            {'reason': 'Insufficient documentation'},
            format='json',
        )
        assert resp.status_code in (status.HTTP_200_OK, status.HTTP_204_NO_CONTENT)


class TestPlatformStats:
    url = reverse('providers:public-stats')

    def test_anonymous_can_view(self, api_client):
        VerifiedProviderFactory()
        resp = api_client.get(self.url)
        assert resp.status_code == status.HTTP_200_OK
        # Response uses snake_case keys
        assert 'verified_providers' in resp.data or 'verifiedProviders' in resp.data


class TestAdminStats:
    url = reverse('providers:admin-stats')

    def test_admin_can_view(self, admin_client):
        resp = admin_client.get(self.url)
        assert resp.status_code == status.HTTP_200_OK

    def test_non_admin_rejected(self, patient_client):
        resp = patient_client.get(self.url)
        assert resp.status_code == status.HTTP_403_FORBIDDEN
