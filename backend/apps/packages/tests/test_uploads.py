"""
Tests for package image upload endpoints.
"""

from unittest.mock import patch

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status

from apps.core.storage import UploadedAsset
from apps.tests.factories import PackageFactory, ProviderUserFactory, ProviderFactory


pytestmark = pytest.mark.django_db


def _png(name='package.png'):
    return SimpleUploadedFile(name, b'\x89PNG\r\n\x1a\n' + b'x' * 100, content_type='image/png')


def _asset(public_id='turqheal/packages/1/images/abc'):
    return UploadedAsset(
        public_id=public_id,
        url=f'https://res.cloudinary.com/test/image/upload/v1/{public_id}.png',
        resource_type='image',
        bytes=100,
    )


class TestPackageUpload:
    def _url(self, pk):
        return reverse('packages:upload-images', kwargs={'pk': pk})

    def test_owner_can_upload(self, api_client, verified_provider):
        from rest_framework_simplejwt.tokens import RefreshToken
        pkg = PackageFactory(provider=verified_provider)
        token = RefreshToken.for_user(verified_provider.user).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        with patch('apps.packages.views.upload_image', return_value=_asset(f'turqheal/packages/{pkg.pk}/images/new')):
            resp = api_client.post(self._url(pkg.pk), {'file': _png()}, format='multipart')
        assert resp.status_code == status.HTTP_201_CREATED
        pkg.refresh_from_db()
        assert len(pkg.images) == 1

    def test_other_provider_cannot_upload(self, api_client, package):
        from rest_framework_simplejwt.tokens import RefreshToken
        intruder = ProviderUserFactory()
        ProviderFactory(user=intruder, is_verified=True)
        token = RefreshToken.for_user(intruder).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        resp = api_client.post(self._url(package.pk), {'file': _png()}, format='multipart')
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_patient_blocked(self, patient_client, package):
        resp = patient_client.post(self._url(package.pk), {'file': _png()}, format='multipart')
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_owner_can_delete_image(self, api_client, verified_provider):
        from rest_framework_simplejwt.tokens import RefreshToken
        pkg = PackageFactory(
            provider=verified_provider,
            images=['https://res.cloudinary.com/test/image/upload/v1/turqheal/packages/1/images/x.png'],
        )
        token = RefreshToken.for_user(verified_provider.user).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        with patch('apps.packages.views.delete_resource', return_value=True):
            resp = api_client.delete(
                self._url(pkg.pk),
                {'url': pkg.images[0]},
                format='json',
            )
        assert resp.status_code == status.HTTP_204_NO_CONTENT
        pkg.refresh_from_db()
        assert pkg.images == []
