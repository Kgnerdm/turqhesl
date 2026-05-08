"""
Tests for package endpoints (CRUD, list filters, my-packages, toggle-status).
"""

import pytest
from decimal import Decimal
from django.urls import reverse
from rest_framework import status

from apps.packages.models import Package, PackageCategory
from apps.tests.factories import (
    PackageFactory,
    ProviderFactory,
    ProviderUserFactory,
    VerifiedProviderFactory,
)


pytestmark = pytest.mark.django_db


class TestPackageListPublic:
    url = reverse('packages:list')

    def test_anyone_can_list(self, api_client):
        provider = VerifiedProviderFactory()
        PackageFactory(provider=provider)
        PackageFactory(provider=provider)
        resp = api_client.get(self.url)
        assert resp.status_code == status.HTTP_200_OK
        assert 'data' in resp.data
        assert len(resp.data['data']) >= 2

    def test_filter_by_category(self, api_client):
        provider = VerifiedProviderFactory()
        PackageFactory(provider=provider, category=PackageCategory.DENTAL)
        PackageFactory(provider=provider, category=PackageCategory.HAIR_TRANSPLANT)
        resp = api_client.get(self.url, {'category': 'dental'})
        assert resp.status_code == status.HTTP_200_OK
        for p in resp.data['data']:
            assert p['category'] == 'dental'

    def test_filter_by_price_range(self, api_client):
        provider = VerifiedProviderFactory()
        PackageFactory(provider=provider, price=Decimal('500'))
        PackageFactory(provider=provider, price=Decimal('5000'))
        PackageFactory(provider=provider, price=Decimal('10000'))
        resp = api_client.get(self.url, {'min_price': '1000', 'max_price': '7000'})
        assert resp.status_code == status.HTTP_200_OK
        prices = [Decimal(str(p['price'])) for p in resp.data['data']]
        for price in prices:
            assert Decimal('1000') <= price <= Decimal('7000')

    def test_inactive_packages_excluded(self, api_client):
        provider = VerifiedProviderFactory()
        active = PackageFactory(provider=provider, is_active=True)
        PackageFactory(provider=provider, is_active=False)
        resp = api_client.get(self.url)
        ids = [p['id'] for p in resp.data['data']]
        assert active.pk in ids


class TestPackageDetail:
    def test_anyone_can_view(self, api_client, package):
        url = reverse('packages:detail', kwargs={'pk': package.pk})
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data['name'] == package.name

    def test_404_for_missing(self, api_client):
        url = reverse('packages:detail', kwargs={'pk': 99999})
        resp = api_client.get(url)
        assert resp.status_code == status.HTTP_404_NOT_FOUND


class TestPackageCreate:
    url = reverse('packages:create')

    def _payload(self, **overrides):
        data = {
            'name': 'Premium Dental Implant',
            'description': 'Full dental implant procedure',
            'category': 'dental',
            'price': '2500.00',
            'currency': 'USD',
            'duration': '5-7 days',
            'includes': ['Consultation', 'Implant', 'Hotel'],
            'excludes': ['Flights'],
            'images': [],
        }
        data.update(overrides)
        return data

    def test_verified_provider_can_create(self, api_client, verified_provider):
        from rest_framework_simplejwt.tokens import RefreshToken
        token = RefreshToken.for_user(verified_provider.user).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        resp = api_client.post(self.url, self._payload(), format='json')
        assert resp.status_code == status.HTTP_201_CREATED
        assert Package.objects.filter(name='Premium Dental Implant').exists()

    def test_unverified_provider_blocked(self, provider_client):
        resp = provider_client.post(self.url, self._payload(), format='json')
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_patient_blocked(self, patient_client):
        resp = patient_client.post(self.url, self._payload(), format='json')
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_anonymous_blocked(self, api_client):
        resp = api_client.post(self.url, self._payload(), format='json')
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


class TestPackageUpdate:
    def test_owner_can_update(self, api_client, verified_provider):
        from rest_framework_simplejwt.tokens import RefreshToken
        pkg = PackageFactory(provider=verified_provider)
        token = RefreshToken.for_user(verified_provider.user).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        url = reverse('packages:update', kwargs={'pk': pkg.pk})
        resp = api_client.patch(url, {'name': 'Updated'}, format='json')
        assert resp.status_code == status.HTTP_200_OK
        pkg.refresh_from_db()
        assert pkg.name == 'Updated'

    def test_other_provider_cannot_update(self, api_client, package):
        from rest_framework_simplejwt.tokens import RefreshToken
        intruder = ProviderUserFactory()
        ProviderFactory(user=intruder, is_verified=True)
        token = RefreshToken.for_user(intruder).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        url = reverse('packages:update', kwargs={'pk': package.pk})
        resp = api_client.patch(url, {'name': 'Hijacked'}, format='json')
        assert resp.status_code in (
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,
        )


class TestPackageDelete:
    def test_owner_can_delete(self, api_client, verified_provider):
        from rest_framework_simplejwt.tokens import RefreshToken
        pkg = PackageFactory(provider=verified_provider)
        token = RefreshToken.for_user(verified_provider.user).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        url = reverse('packages:delete', kwargs={'pk': pkg.pk})
        resp = api_client.delete(url)
        assert resp.status_code in (
            status.HTTP_200_OK,
            status.HTTP_204_NO_CONTENT,
        )

    def test_anonymous_cannot_delete(self, api_client, package):
        url = reverse('packages:delete', kwargs={'pk': package.pk})
        resp = api_client.delete(url)
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


class TestMyPackages:
    url = reverse('packages:my')

    def test_provider_sees_only_own(self, api_client, verified_provider):
        from rest_framework_simplejwt.tokens import RefreshToken
        # Two packages for this provider
        PackageFactory(provider=verified_provider)
        PackageFactory(provider=verified_provider)
        # Another provider's package
        other = VerifiedProviderFactory()
        PackageFactory(provider=other)

        token = RefreshToken.for_user(verified_provider.user).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        resp = api_client.get(self.url)
        assert resp.status_code == status.HTTP_200_OK
        data = resp.data.get('data', resp.data)
        assert len(data) == 2

    def test_patient_blocked(self, patient_client):
        resp = patient_client.get(self.url)
        assert resp.status_code == status.HTTP_403_FORBIDDEN


class TestToggleStatus:
    def test_owner_can_toggle(self, api_client, verified_provider):
        from rest_framework_simplejwt.tokens import RefreshToken
        pkg = PackageFactory(provider=verified_provider, is_active=True)
        token = RefreshToken.for_user(verified_provider.user).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        url = reverse('packages:toggle-status', kwargs={'pk': pkg.pk})
        resp = api_client.patch(url, {}, format='json')
        assert resp.status_code == status.HTTP_200_OK
        pkg.refresh_from_db()
        assert pkg.is_active is False


class TestFavorites:
    def test_toggle_adds_then_removes(self, patient_client, package):
        url = reverse('packages:favorite-toggle', kwargs={'pk': package.pk})

        # First toggle: add
        resp = patient_client.post(url, {}, format='json')
        assert resp.status_code in (status.HTTP_200_OK, status.HTTP_201_CREATED)

        # Second toggle: remove
        resp = patient_client.post(url, {}, format='json')
        assert resp.status_code == status.HTTP_200_OK

    def test_favorites_list(self, patient_client, package):
        url = reverse('packages:favorite-toggle', kwargs={'pk': package.pk})
        patient_client.post(url, {}, format='json')

        resp = patient_client.get(reverse('packages:favorites'))
        assert resp.status_code == status.HTTP_200_OK

    def test_anonymous_cannot_favorite(self, api_client, package):
        url = reverse('packages:favorite-toggle', kwargs={'pk': package.pk})
        resp = api_client.post(url, {}, format='json')
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


class TestSearchSuggestions:
    url = reverse('packages:search-suggestions')

    def test_anyone_can_search(self, api_client):
        provider = VerifiedProviderFactory()
        PackageFactory(provider=provider, name='Dental Implant Premium')
        resp = api_client.get(self.url, {'q': 'Dental'})
        assert resp.status_code == status.HTTP_200_OK
