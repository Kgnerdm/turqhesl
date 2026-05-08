"""
Project-wide pytest fixtures.

Auto-loaded by pytest from any test under the project.
"""

import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.tests.factories import (
    AdminUserFactory,
    BookingFactory,
    PackageFactory,
    PatientFactory,
    ProviderFactory,
    ProviderUserFactory,
    VerifiedProviderFactory,
)


@pytest.fixture
def api_client():
    """Anonymous DRF client."""
    return APIClient()


def _auth_client(user):
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client


@pytest.fixture
def patient(db):
    return PatientFactory()


@pytest.fixture
def patient_client(patient):
    return _auth_client(patient)


@pytest.fixture
def provider_user(db):
    return ProviderUserFactory()


@pytest.fixture
def provider(db, provider_user):
    return ProviderFactory(user=provider_user)


@pytest.fixture
def verified_provider(db):
    return VerifiedProviderFactory()


@pytest.fixture
def provider_client(provider):
    return _auth_client(provider.user)


@pytest.fixture
def admin_user(db):
    return AdminUserFactory()


@pytest.fixture
def admin_client(admin_user):
    return _auth_client(admin_user)


@pytest.fixture
def package(db, verified_provider):
    return PackageFactory(provider=verified_provider)


@pytest.fixture
def booking(db, patient, package):
    return BookingFactory(
        patient=patient,
        provider=package.provider,
        package=package,
    )
