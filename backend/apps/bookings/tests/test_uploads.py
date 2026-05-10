"""
Tests for booking medical document upload + signed URL endpoints.

Documents are private — Cloudinary 'authenticated' resource type,
delivery requires a signed URL.
"""

from unittest.mock import patch

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status

from apps.core.storage import UploadedAsset
from apps.tests.factories import PatientFactory


pytestmark = pytest.mark.django_db


def _pdf(name='medical.pdf'):
    return SimpleUploadedFile(name, b'%PDF-1.4\n' + b'x' * 200, content_type='application/pdf')


def _doc_asset(public_id='turqheal/bookings/1/documents/abc'):
    return UploadedAsset(
        public_id=public_id,
        url=f'https://res.cloudinary.com/test/raw/authenticated/v1/{public_id}.pdf',
        resource_type='raw',
        bytes=200,
        format='pdf',
    )


class TestDocumentUpload:
    def _url(self, pk):
        return reverse('bookings:booking-document-upload', kwargs={'pk': pk})

    def test_patient_can_upload_to_own_booking(self, patient_client, booking):
        with patch('apps.bookings.views.upload_document', return_value=_doc_asset()):
            resp = patient_client.post(
                self._url(booking.pk),
                {'file': _pdf()},
                format='multipart',
            )
        assert resp.status_code == status.HTTP_201_CREATED
        booking.refresh_from_db()
        assert len(booking.documents) == 1
        assert booking.documents[0]['public_id']
        assert booking.documents[0]['uploaded_by'] == booking.patient_id

    def test_other_patient_cannot_upload(self, api_client, booking):
        from rest_framework_simplejwt.tokens import RefreshToken
        intruder = PatientFactory()
        token = RefreshToken.for_user(intruder).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        resp = api_client.post(self._url(booking.pk), {'file': _pdf()}, format='multipart')
        assert resp.status_code == status.HTTP_404_NOT_FOUND

    def test_provider_can_upload_to_their_booking(self, api_client, booking):
        from rest_framework_simplejwt.tokens import RefreshToken
        token = RefreshToken.for_user(booking.provider.user).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        with patch('apps.bookings.views.upload_document', return_value=_doc_asset()):
            resp = api_client.post(self._url(booking.pk), {'file': _pdf()}, format='multipart')
        assert resp.status_code == status.HTTP_201_CREATED

    def test_anonymous_blocked(self, api_client, booking):
        resp = api_client.post(self._url(booking.pk), {'file': _pdf()}, format='multipart')
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_delete_document(self, patient_client, booking):
        booking.documents = [{
            'public_id': 'turqheal/bookings/1/documents/abc',
            'filename': 'x.pdf',
            'bytes': 100,
            'uploaded_at': '2026-01-01T00:00:00Z',
            'uploaded_by': booking.patient_id,
        }]
        booking.save()

        with patch('apps.bookings.views.delete_resource', return_value=True):
            resp = patient_client.delete(
                self._url(booking.pk),
                {'public_id': 'turqheal/bookings/1/documents/abc'},
                format='json',
            )
        assert resp.status_code == status.HTTP_204_NO_CONTENT
        booking.refresh_from_db()
        assert booking.documents == []


class TestSignedURL:
    def _url(self, pk):
        return reverse('bookings:booking-document-signed-url', kwargs={'pk': pk})

    def test_patient_gets_signed_url(self, patient_client, booking):
        booking.documents = [{
            'public_id': 'turqheal/bookings/1/documents/abc',
            'filename': 'x.pdf',
            'bytes': 100,
            'uploaded_at': '2026-01-01T00:00:00Z',
            'uploaded_by': booking.patient_id,
        }]
        booking.save()

        signed = 'https://res.cloudinary.com/test/raw/authenticated/s--SIG--/v1/turqheal/bookings/1/documents/abc.pdf'
        with patch('apps.bookings.views.signed_document_url', return_value=signed):
            resp = patient_client.get(
                self._url(booking.pk),
                {'public_id': 'turqheal/bookings/1/documents/abc'},
            )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data['url'] == signed
        assert resp.data['expires_in_seconds'] == 900

    def test_unknown_public_id_returns_404(self, patient_client, booking):
        resp = patient_client.get(self._url(booking.pk), {'public_id': 'never-uploaded'})
        assert resp.status_code == status.HTTP_404_NOT_FOUND

    def test_other_patient_blocked(self, api_client, booking):
        from rest_framework_simplejwt.tokens import RefreshToken
        intruder = PatientFactory()
        token = RefreshToken.for_user(intruder).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        resp = api_client.get(self._url(booking.pk), {'public_id': 'whatever'})
        assert resp.status_code == status.HTTP_404_NOT_FOUND
