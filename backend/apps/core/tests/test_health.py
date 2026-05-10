"""Tests for the /api/health/ endpoint."""

from unittest.mock import patch

import pytest
from django.urls import reverse
from rest_framework import status


pytestmark = pytest.mark.django_db


class TestHealth:
    url = reverse('core:health')

    def test_returns_200_when_everything_up(self, api_client):
        with patch('apps.core.views.HealthCheckView._check_redis', return_value=True):
            resp = api_client.get(self.url)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data['status'] == 'ok'
        assert resp.data['checks']['database'] == 'ok'
        assert resp.data['checks']['redis'] == 'ok'
        assert 'response_time_ms' in resp.data

    def test_returns_503_when_redis_down(self, api_client):
        with patch('apps.core.views.HealthCheckView._check_redis', return_value=False):
            resp = api_client.get(self.url)
        assert resp.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
        assert resp.data['status'] == 'degraded'
        assert resp.data['checks']['redis'] == 'error'

    def test_no_auth_required(self, api_client):
        # No Authorization header at all — should still work
        resp = api_client.get(self.url)
        assert resp.status_code in (status.HTTP_200_OK, status.HTTP_503_SERVICE_UNAVAILABLE)
