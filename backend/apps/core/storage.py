"""
Cloudinary storage utility.

Wraps cloudinary.uploader / cloudinary.utils so the rest of the codebase
never imports cloudinary directly. This makes mocking trivial in tests
and allows swapping the provider later.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, BinaryIO, Iterable

import cloudinary
import cloudinary.uploader
import cloudinary.utils

logger = logging.getLogger(__name__)


# Maximum upload sizes (bytes). Frontend should pre-validate, but enforce server-side too.
# Limits aligned with Cloudinary free plan:
#   - 10 MB max image file size
#   - 10 MB max raw file size
# We keep images at 8 MB to leave headroom for any wrapper overhead.
MAX_IMAGE_BYTES = 8 * 1024 * 1024       # 8 MB per image
MAX_DOCUMENT_BYTES = 10 * 1024 * 1024   # 10 MB per medical document (Cloudinary free plan limit)

ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}
ALLOWED_DOCUMENT_TYPES = {
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}


class StorageError(Exception):
    """Raised when an upload, delete, or URL signing operation fails."""


@dataclass(frozen=True)
class UploadedAsset:
    """The bits we care about from a Cloudinary upload response."""

    public_id: str
    url: str          # CDN URL with secure HTTPS
    resource_type: str  # 'image' or 'raw'
    bytes: int
    format: str | None = None
    width: int | None = None
    height: int | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            'public_id': self.public_id,
            'url': self.url,
            'resource_type': self.resource_type,
            'bytes': self.bytes,
            'format': self.format,
            'width': self.width,
            'height': self.height,
        }


def _ensure_configured() -> None:
    config = cloudinary.config()
    if not config.cloud_name or not config.api_key or not config.api_secret:
        raise StorageError(
            'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, '
            'CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment.'
        )


def validate_image(file_obj: BinaryIO, content_type: str | None) -> None:
    """Reject obviously bad uploads before they reach the network."""
    if content_type and content_type not in ALLOWED_IMAGE_TYPES:
        raise StorageError(
            f'Unsupported image type: {content_type}. '
            f'Allowed: {sorted(ALLOWED_IMAGE_TYPES)}'
        )
    size = getattr(file_obj, 'size', None)
    if size is not None and size > MAX_IMAGE_BYTES:
        raise StorageError(
            f'Image is too large ({size} bytes). Max allowed: {MAX_IMAGE_BYTES} bytes.'
        )


def validate_document(file_obj: BinaryIO, content_type: str | None) -> None:
    if content_type and content_type not in ALLOWED_DOCUMENT_TYPES:
        raise StorageError(
            f'Unsupported document type: {content_type}. '
            f'Allowed: {sorted(ALLOWED_DOCUMENT_TYPES)}'
        )
    size = getattr(file_obj, 'size', None)
    if size is not None and size > MAX_DOCUMENT_BYTES:
        raise StorageError(
            f'Document is too large ({size} bytes). Max allowed: {MAX_DOCUMENT_BYTES} bytes.'
        )


def upload_image(
    file_obj: BinaryIO,
    *,
    folder: str,
    public_id: str | None = None,
    content_type: str | None = None,
    tags: Iterable[str] | None = None,
) -> UploadedAsset:
    """
    Upload a public image (provider/package gallery, logo, cover).

    Cloudinary will deliver it via CDN with `f_auto,q_auto` transformations
    that downstream code can apply to URLs (see `optimized_url`).
    """
    _ensure_configured()
    validate_image(file_obj, content_type)
    try:
        result = cloudinary.uploader.upload(
            file_obj,
            folder=folder,
            public_id=public_id,
            resource_type='image',
            tags=list(tags) if tags else None,
            overwrite=False,
            unique_filename=True,
            use_filename=False,
        )
    except Exception as exc:  # cloudinary raises a wide net
        logger.exception('Cloudinary image upload failed')
        raise StorageError(f'Image upload failed: {exc}') from exc

    return UploadedAsset(
        public_id=result['public_id'],
        url=result['secure_url'],
        resource_type=result.get('resource_type', 'image'),
        bytes=result.get('bytes', 0),
        format=result.get('format'),
        width=result.get('width'),
        height=result.get('height'),
    )


def upload_document(
    file_obj: BinaryIO,
    *,
    folder: str,
    public_id: str | None = None,
    content_type: str | None = None,
    tags: Iterable[str] | None = None,
) -> UploadedAsset:
    """
    Upload a private document (medical records, etc.).

    Stored as a 'raw' resource with type='authenticated', which forces
    Cloudinary to require a signed URL on every access.
    """
    _ensure_configured()
    validate_document(file_obj, content_type)
    try:
        result = cloudinary.uploader.upload(
            file_obj,
            folder=folder,
            public_id=public_id,
            resource_type='raw',
            type='authenticated',  # signed URL required for delivery
            tags=list(tags) if tags else None,
            overwrite=False,
            unique_filename=True,
            use_filename=False,
        )
    except Exception as exc:
        logger.exception('Cloudinary document upload failed')
        raise StorageError(f'Document upload failed: {exc}') from exc

    return UploadedAsset(
        public_id=result['public_id'],
        url=result['secure_url'],
        resource_type=result.get('resource_type', 'raw'),
        bytes=result.get('bytes', 0),
        format=result.get('format'),
    )


def delete_resource(public_id: str, *, resource_type: str = 'image') -> bool:
    """Delete an asset by public_id. Returns True on success."""
    _ensure_configured()
    try:
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type=resource_type,
            invalidate=True,
        )
    except Exception as exc:
        logger.exception('Cloudinary delete failed for %s', public_id)
        raise StorageError(f'Delete failed: {exc}') from exc

    return result.get('result') == 'ok'


def signed_document_url(public_id: str, *, expires_in_seconds: int = 900) -> str:
    """
    Return a time-limited URL for a private document.

    Default TTL is 15 minutes — short enough for KVKK/GDPR posture,
    long enough for a real download.
    """
    _ensure_configured()
    import time

    expires_at = int(time.time()) + expires_in_seconds
    url, _options = cloudinary.utils.cloudinary_url(
        public_id,
        resource_type='raw',
        type='authenticated',
        sign_url=True,
        secure=True,
        auth_token={
            'duration': expires_in_seconds,
            'start_time': int(time.time()),
        } if cloudinary.config().api_secret else None,
        expires_at=expires_at,
    )
    return url


def public_id_from_url(url: str) -> str | None:
    """
    Extract a Cloudinary public_id from a delivery URL.

    Example:
      https://res.cloudinary.com/demo/image/upload/v1234/folder/abc.jpg
      → 'folder/abc'

    Returns None if the URL doesn't look like a Cloudinary delivery URL.
    """
    import re

    if not url or 'res.cloudinary.com' not in url:
        return None
    match = re.search(
        r'/(?:image|raw|video)/(?:upload|authenticated)/'
        r'(?:[^/]+/)?'        # optional transformation segment
        r'(?:v\d+/)?'         # optional version
        r'(?P<public_id>.+?)'
        r'(?:\.\w+)?$',
        url,
    )
    if not match:
        return None
    return match.group('public_id')


def optimized_image_url(
    public_id_or_url: str,
    *,
    width: int | None = None,
    height: int | None = None,
    crop: str = 'fill',
) -> str:
    """
    Build a delivery URL with auto format + auto quality + optional resize.

    Accepts either a bare public_id or a full secure_url (which we hand back
    untouched if we don't have config — useful in tests).
    """
    if not cloudinary.config().cloud_name:
        return public_id_or_url

    transformation = {'fetch_format': 'auto', 'quality': 'auto'}
    if width:
        transformation['width'] = width
    if height:
        transformation['height'] = height
    if width or height:
        transformation['crop'] = crop

    url, _options = cloudinary.utils.cloudinary_url(
        public_id_or_url,
        secure=True,
        transformation=[transformation],
    )
    return url
