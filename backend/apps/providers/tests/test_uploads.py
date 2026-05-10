"""
Tests for provider media upload endpoints.

Cloudinary calls are mocked — these tests verify endpoint contracts,
permission boundaries, and DB side-effects only.
"""

from io import BytesIO
from unittest.mock import patch

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status

from apps.core.storage import UploadedAsset


pytestmark = pytest.mark.django_db


def _png(name='photo.png'):
    return SimpleUploadedFile(name, b'\x89PNG\r\n\x1a\n' + b'x' * 200, content_type='image/png')


def _fake_asset(folder='turqheal/providers/1/logo', public_id='turqheal/providers/1/logo/abc'):
    url = f'https://res.cloudinary.com/test/image/upload/v1/{public_id}.png'
    return UploadedAsset(
        public_id=public_id,
        url=url,
        resource_type='image',
        bytes=200,
        format='png',
        width=400,
        height=300,
    )


class TestLogoUpload:
    url = reverse('providers:upload-logo')

    def test_provider_can_upload(self, provider_client, provider):
        with patch('apps.providers.views.upload_image', return_value=_fake_asset()):
            resp = provider_client.post(self.url, {'file': _png()}, format='multipart')
        assert resp.status_code == status.HTTP_201_CREATED
        provider.refresh_from_db()
        assert provider.logo_url.startswith('https://res.cloudinary.com')

    def test_old_logo_is_deleted(self, provider_client, provider):
        provider.logo_url = (
            'https://res.cloudinary.com/test/image/upload/v1/turqheal/providers/'
            f'{provider.pk}/logo/old.png'
        )
        provider.save()
        with patch('apps.providers.views.upload_image', return_value=_fake_asset()), \
             patch('apps.providers.views.delete_resource') as mock_del:
            provider_client.post(self.url, {'file': _png()}, format='multipart')
        assert mock_del.called

    def test_missing_file_returns_400(self, provider_client):
        resp = provider_client.post(self.url, {}, format='multipart')
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_patient_blocked(self, patient_client):
        resp = patient_client.post(self.url, {'file': _png()}, format='multipart')
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_anonymous_blocked(self, api_client):
        resp = api_client.post(self.url, {'file': _png()}, format='multipart')
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


class TestCoverUpload:
    url = reverse('providers:upload-cover')

    def test_provider_can_upload(self, provider_client, provider):
        with patch('apps.providers.views.upload_image', return_value=_fake_asset(public_id='turqheal/providers/1/cover/abc')):
            resp = provider_client.post(self.url, {'file': _png()}, format='multipart')
        assert resp.status_code == status.HTTP_201_CREATED
        provider.refresh_from_db()
        assert provider.cover_image_url.startswith('https://res.cloudinary.com')


class TestGalleryUpload:
    url = reverse('providers:upload-gallery')

    def test_appends_to_gallery(self, provider_client, provider):
        provider.images = ['https://res.cloudinary.com/test/image/upload/v1/existing.jpg']
        provider.save()

        with patch('apps.providers.views.upload_image', return_value=_fake_asset(public_id='turqheal/providers/1/gallery/new')):
            resp = provider_client.post(self.url, {'file': _png()}, format='multipart')
        assert resp.status_code == status.HTTP_201_CREATED
        provider.refresh_from_db()
        assert len(provider.images) == 2

    def test_delete_removes_image(self, provider_client, provider):
        gallery_url = 'https://res.cloudinary.com/test/image/upload/v1/turqheal/providers/1/gallery/x.jpg'
        provider.images = [gallery_url]
        provider.save()

        with patch('apps.providers.views.delete_resource', return_value=True):
            resp = provider_client.delete(self.url, {'url': gallery_url}, format='json')
        assert resp.status_code == status.HTTP_204_NO_CONTENT
        provider.refresh_from_db()
        assert provider.images == []

    def test_delete_unknown_url_returns_404(self, provider_client, provider):
        resp = provider_client.delete(
            self.url,
            {'url': 'https://res.cloudinary.com/x/image/upload/v1/not-mine.jpg'},
            format='json',
        )
        assert resp.status_code == status.HTTP_404_NOT_FOUND
