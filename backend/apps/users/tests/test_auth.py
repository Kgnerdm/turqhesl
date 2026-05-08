"""
Tests for authentication endpoints (register, login, me, refresh, change-password, logout).
"""

import pytest
from django.urls import reverse
from rest_framework import status

from apps.tests.factories import PatientFactory


pytestmark = pytest.mark.django_db


class TestRegister:
    url = reverse('users:register')

    def test_patient_can_register(self, api_client):
        payload = {
            'email': 'newpatient@test.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
            'first_name': 'Jane',
            'last_name': 'Doe',
            'role': 'patient',
        }
        resp = api_client.post(self.url, payload, format='json')
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data['user']['email'] == 'newpatient@test.com'
        assert resp.data['user']['role'] == 'patient'
        assert 'access' in resp.data['tokens']
        assert 'refresh' in resp.data['tokens']

    def test_provider_can_register(self, api_client):
        payload = {
            'email': 'newclinic@test.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
            'first_name': 'Clinic',
            'last_name': 'Owner',
            'role': 'provider',
        }
        resp = api_client.post(self.url, payload, format='json')
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data['user']['role'] == 'provider'

    def test_admin_role_rejected(self, api_client):
        payload = {
            'email': 'fakeadmin@test.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
            'first_name': 'Fake',
            'last_name': 'Admin',
            'role': 'admin',
        }
        resp = api_client.post(self.url, payload, format='json')
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_password_mismatch(self, api_client):
        payload = {
            'email': 'mismatch@test.com',
            'password': 'SecurePass123!',
            'password_confirm': 'Different123!',
            'first_name': 'M',
            'last_name': 'M',
        }
        resp = api_client.post(self.url, payload, format='json')
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_duplicate_email(self, api_client):
        PatientFactory(email='dup@test.com')
        payload = {
            'email': 'dup@test.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
            'first_name': 'Dup',
            'last_name': 'User',
        }
        resp = api_client.post(self.url, payload, format='json')
        assert resp.status_code == status.HTTP_400_BAD_REQUEST


class TestLogin:
    url = reverse('users:login')

    def test_valid_credentials(self, api_client):
        PatientFactory(email='alice@test.com', password='Pass123!')
        resp = api_client.post(
            self.url,
            {'email': 'alice@test.com', 'password': 'Pass123!'},
            format='json',
        )
        assert resp.status_code == status.HTTP_200_OK
        assert 'access' in resp.data['tokens']

    def test_wrong_password(self, api_client):
        PatientFactory(email='bob@test.com', password='Correct123!')
        resp = api_client.post(
            self.url,
            {'email': 'bob@test.com', 'password': 'Wrong'},
            format='json',
        )
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unknown_email(self, api_client):
        resp = api_client.post(
            self.url,
            {'email': 'nobody@test.com', 'password': 'whatever'},
            format='json',
        )
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_inactive_user(self, api_client):
        u = PatientFactory(email='inactive@test.com', password='Pass123!')
        u.is_active = False
        u.save()
        resp = api_client.post(
            self.url,
            {'email': 'inactive@test.com', 'password': 'Pass123!'},
            format='json',
        )
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


class TestMe:
    url = reverse('users:me')

    def test_authenticated_returns_profile(self, patient_client, patient):
        resp = patient_client.get(self.url)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data['email'] == patient.email

    def test_anonymous_rejected(self, api_client):
        resp = api_client.get(self.url)
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_patch_updates_profile(self, patient_client):
        resp = patient_client.patch(
            self.url,
            {'first_name': 'NewName', 'phone': '+1234567890'},
            format='json',
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data['first_name'] == 'NewName'
        assert resp.data['phone'] == '+1234567890'

    def test_patch_cannot_change_role(self, patient_client, patient):
        patient_client.patch(self.url, {'role': 'admin'}, format='json')
        patient.refresh_from_db()
        assert patient.role == 'patient'


class TestTokenRefresh:
    url = reverse('users:token_refresh')

    def test_refresh_returns_new_access(self, api_client):
        from rest_framework_simplejwt.tokens import RefreshToken
        u = PatientFactory()
        refresh = RefreshToken.for_user(u)
        resp = api_client.post(self.url, {'refresh': str(refresh)}, format='json')
        assert resp.status_code == status.HTTP_200_OK
        assert 'access' in resp.data

    def test_invalid_refresh_rejected(self, api_client):
        resp = api_client.post(self.url, {'refresh': 'garbage'}, format='json')
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED


class TestChangePassword:
    url = reverse('users:change_password')

    def test_change_password_success(self, api_client):
        u = PatientFactory(email='c@test.com', password='OldPass123!')
        from rest_framework_simplejwt.tokens import RefreshToken
        token = RefreshToken.for_user(u).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        resp = api_client.post(
            self.url,
            {
                'current_password': 'OldPass123!',
                'new_password': 'NewPass456!',
                'confirm_password': 'NewPass456!',
            },
            format='json',
        )
        assert resp.status_code == status.HTTP_200_OK
        u.refresh_from_db()
        assert u.check_password('NewPass456!')

    def test_wrong_old_password(self, patient_client):
        resp = patient_client.post(
            self.url,
            {
                'current_password': 'Wrong',
                'new_password': 'NewPass456!',
                'confirm_password': 'NewPass456!',
            },
            format='json',
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST


class TestLogout:
    url = reverse('users:logout')

    def test_logout_blacklists_refresh(self, api_client):
        from rest_framework_simplejwt.tokens import RefreshToken
        u = PatientFactory()
        refresh = RefreshToken.for_user(u)
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        resp = api_client.post(self.url, {'refresh': str(refresh)}, format='json')
        assert resp.status_code in (status.HTTP_200_OK, status.HTTP_205_RESET_CONTENT)
