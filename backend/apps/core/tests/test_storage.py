"""
Tests for the Cloudinary storage helper.

These tests don't hit the network — they mock cloudinary.uploader/utils.
"""

from io import BytesIO
from unittest.mock import patch

import pytest

from apps.core import storage


class _FakeFile(BytesIO):
    """BytesIO with the .size and .content_type attrs DRF gives us."""

    def __init__(self, data: bytes, *, name='file.jpg', content_type='image/jpeg'):
        super().__init__(data)
        self.name = name
        self.content_type = content_type
        self.size = len(data)


@pytest.fixture
def configured(monkeypatch):
    """Pretend Cloudinary is configured so _ensure_configured passes."""
    import cloudinary

    cloudinary.config(
        cloud_name='test',
        api_key='key',
        api_secret='secret',
        secure=True,
    )
    yield


class TestValidation:
    def test_image_rejects_unsupported_type(self):
        f = _FakeFile(b'x', content_type='application/pdf')
        with pytest.raises(storage.StorageError):
            storage.validate_image(f, 'application/pdf')

    def test_image_rejects_oversize(self):
        big = _FakeFile(b'x' * (storage.MAX_IMAGE_BYTES + 1))
        with pytest.raises(storage.StorageError):
            storage.validate_image(big, 'image/jpeg')

    def test_image_accepts_valid(self):
        f = _FakeFile(b'x' * 100, content_type='image/png')
        storage.validate_image(f, 'image/png')  # should not raise

    def test_document_rejects_oversize(self):
        big = _FakeFile(b'x' * (storage.MAX_DOCUMENT_BYTES + 1), content_type='application/pdf')
        with pytest.raises(storage.StorageError):
            storage.validate_document(big, 'application/pdf')


class TestUploadImage:
    def test_returns_uploaded_asset_on_success(self, configured):
        fake_response = {
            'public_id': 'turqheal/providers/1/logo/abc123',
            'secure_url': 'https://res.cloudinary.com/test/image/upload/v1/turqheal/providers/1/logo/abc123.png',
            'resource_type': 'image',
            'bytes': 12345,
            'format': 'png',
            'width': 400,
            'height': 400,
        }
        with patch('cloudinary.uploader.upload', return_value=fake_response) as mock_upload:
            f = _FakeFile(b'fakepng', content_type='image/png')
            asset = storage.upload_image(
                f,
                folder='turqheal/providers/1/logo',
                content_type='image/png',
            )
        mock_upload.assert_called_once()
        assert asset.public_id == fake_response['public_id']
        assert asset.url == fake_response['secure_url']
        assert asset.bytes == 12345

    def test_wraps_provider_errors(self, configured):
        with patch(
            'cloudinary.uploader.upload',
            side_effect=RuntimeError('500 from provider'),
        ):
            f = _FakeFile(b'x', content_type='image/jpeg')
            with pytest.raises(storage.StorageError):
                storage.upload_image(f, folder='x', content_type='image/jpeg')


class TestUploadDocument:
    def test_uses_authenticated_type(self, configured):
        fake = {
            'public_id': 'turqheal/bookings/1/documents/abc',
            'secure_url': 'https://res.cloudinary.com/test/raw/authenticated/v1/turqheal/bookings/1/documents/abc.pdf',
            'resource_type': 'raw',
            'bytes': 100,
            'format': 'pdf',
        }
        with patch('cloudinary.uploader.upload', return_value=fake) as mock_upload:
            f = _FakeFile(b'%PDF', content_type='application/pdf')
            asset = storage.upload_document(
                f,
                folder='turqheal/bookings/1/documents',
                content_type='application/pdf',
            )
        kwargs = mock_upload.call_args.kwargs
        assert kwargs['resource_type'] == 'raw'
        assert kwargs['type'] == 'authenticated'
        assert asset.resource_type == 'raw'


class TestDelete:
    def test_returns_true_on_ok(self, configured):
        with patch('cloudinary.uploader.destroy', return_value={'result': 'ok'}):
            assert storage.delete_resource('foo/bar') is True

    def test_returns_false_when_not_ok(self, configured):
        with patch('cloudinary.uploader.destroy', return_value={'result': 'not_found'}):
            assert storage.delete_resource('foo/bar') is False


class TestPublicIdFromUrl:
    def test_extracts_basic(self):
        url = 'https://res.cloudinary.com/demo/image/upload/v1234/folder/abc.jpg'
        assert storage.public_id_from_url(url) == 'folder/abc'

    def test_extracts_nested(self):
        url = 'https://res.cloudinary.com/demo/image/upload/v1/turqheal/providers/5/logo/abc.png'
        assert storage.public_id_from_url(url) == 'turqheal/providers/5/logo/abc'

    def test_raw_authenticated(self):
        url = 'https://res.cloudinary.com/demo/raw/authenticated/v1/turqheal/bookings/1/documents/x.pdf'
        assert storage.public_id_from_url(url) == 'turqheal/bookings/1/documents/x'

    def test_returns_none_for_non_cloudinary(self):
        assert storage.public_id_from_url('https://example.com/foo.jpg') is None

    def test_returns_none_for_empty(self):
        assert storage.public_id_from_url('') is None


class TestEnsureConfigured:
    def test_raises_when_not_configured(self, monkeypatch):
        import cloudinary

        cloudinary.config(cloud_name='', api_key='', api_secret='')
        with pytest.raises(storage.StorageError):
            storage.upload_image(_FakeFile(b'x'), folder='x', content_type='image/png')
