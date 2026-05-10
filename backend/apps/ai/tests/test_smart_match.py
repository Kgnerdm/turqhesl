"""Tests for SmartMatch service + endpoint.

Cloudinary-style: we mock the LLM provider and assert against the JSON
contract. No network calls.
"""

from __future__ import annotations

import json
from unittest.mock import patch

import pytest
from django.urls import reverse
from rest_framework import status

from apps.ai import services
from apps.ai.providers import MockProvider
from apps.ai.providers.base import CompletionResult, LLMError
from apps.tests.factories import PackageFactory, VerifiedProviderFactory


pytestmark = pytest.mark.django_db


def _patch_provider(canned: dict):
    """Helper: every call to get_provider() returns a MockProvider with this response."""
    return patch(
        'apps.ai.services.get_provider',
        return_value=MockProvider(canned_response=canned),
    )


class TestSmartMatchService:
    def test_returns_packages_in_priority_order(self):
        provider = VerifiedProviderFactory()
        p1 = PackageFactory(provider=provider, name='Dental Implant Premium')
        p2 = PackageFactory(provider=provider, name='Hair Transplant DHI')
        PackageFactory(provider=provider, name='Cataract Surgery')  # not in matches

        canned = {
            'matches': [
                {'package_id': p2.id, 'reason': 'Hair transplant matches your stated goal'},
                {'package_id': p1.id, 'reason': 'Dental implant available too'},
            ],
        }
        with _patch_provider(canned):
            result = services.smart_match('I want a hair transplant')

        assert len(result) == 2
        assert result[0].package.id == p2.id
        assert 'Hair' in result[0].reason

    def test_filters_out_hallucinated_ids(self):
        provider = VerifiedProviderFactory()
        real = PackageFactory(provider=provider)

        canned = {
            'matches': [
                {'package_id': 99999, 'reason': 'Hallucinated package'},
                {'package_id': real.id, 'reason': 'Real one'},
            ],
        }
        with _patch_provider(canned):
            result = services.smart_match('something')

        assert [m.package.id for m in result] == [real.id]

    def test_caps_reason_length(self):
        provider = VerifiedProviderFactory()
        p = PackageFactory(provider=provider)

        canned = {
            'matches': [{'package_id': p.id, 'reason': 'X' * 1000}],
        }
        with _patch_provider(canned):
            result = services.smart_match('something')

        assert len(result[0].reason) <= 200

    def test_returns_empty_when_no_active_packages(self):
        # No packages exist
        with _patch_provider({'matches': [{'package_id': 1, 'reason': 'whatever'}]}):
            result = services.smart_match('hair')
        assert result == []

    def test_inactive_packages_excluded(self):
        provider = VerifiedProviderFactory()
        active = PackageFactory(provider=provider, is_active=True)
        PackageFactory(provider=provider, is_active=False)

        canned = {'matches': [{'package_id': active.id, 'reason': 'ok'}]}
        with _patch_provider(canned):
            result = services.smart_match('test')
        assert len(result) == 1
        assert result[0].package.id == active.id

    def test_empty_query_returns_empty(self):
        VerifiedProviderFactory()  # ensure DB has data
        with _patch_provider({'matches': []}):
            assert services.smart_match('') == []
            assert services.smart_match('   ') == []

    def test_malformed_json_returns_empty(self):
        provider = VerifiedProviderFactory()
        PackageFactory(provider=provider)

        bad_provider = type('Bad', (), {
            'name': 'bad',
            'complete': lambda self, **kw: CompletionResult(content='not json {{{', model='bad'),
        })()
        with patch('apps.ai.services.get_provider', return_value=bad_provider):
            result = services.smart_match('something')
        assert result == []

    def test_llm_error_returns_empty(self):
        provider = VerifiedProviderFactory()
        PackageFactory(provider=provider)

        broken = type('Broken', (), {
            'name': 'broken',
            'complete': lambda self, **kw: (_ for _ in ()).throw(LLMError('upstream timeout')),
        })()
        with patch('apps.ai.services.get_provider', return_value=broken):
            result = services.smart_match('something')
        assert result == []

    def test_caps_to_three_matches(self):
        provider = VerifiedProviderFactory()
        ids = [PackageFactory(provider=provider).id for _ in range(5)]

        canned = {
            'matches': [{'package_id': i, 'reason': f'r{i}'} for i in ids],
        }
        with _patch_provider(canned):
            result = services.smart_match('all of them please', limit=3)

        assert len(result) == 3


class TestSmartMatchEndpoint:
    url = reverse('ai:smart-match')

    def test_anonymous_can_use(self, api_client):
        provider = VerifiedProviderFactory()
        p = PackageFactory(provider=provider)
        canned = {'matches': [{'package_id': p.id, 'reason': 'matches well'}]}
        with _patch_provider(canned):
            resp = api_client.post(
                self.url,
                {'query': 'I need a dental implant'},
                format='json',
            )
        assert resp.status_code == status.HTTP_200_OK
        assert len(resp.data['matches']) == 1
        assert resp.data['matches'][0]['reason'] == 'matches well'
        assert resp.data['matches'][0]['package']['name'] == p.name

    def test_short_query_rejected(self, api_client):
        resp = api_client.post(self.url, {'query': 'hi'}, format='json')
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_long_query_rejected(self, api_client):
        resp = api_client.post(self.url, {'query': 'x' * 1000}, format='json')
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_missing_query_rejected(self, api_client):
        resp = api_client.post(self.url, {}, format='json')
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_returns_empty_matches_when_provider_unavailable(self, api_client):
        # No packages → returns empty matches list (200, not 500)
        resp = api_client.post(
            self.url,
            {'query': 'something with enough chars'},
            format='json',
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data['matches'] == []


class TestProviderFactory:
    def test_falls_back_to_mock_when_no_api_key(self, settings):
        from apps.ai.providers import get_provider, MockProvider
        settings.AI_PROVIDER = ''
        settings.GROQ_API_KEY = ''
        assert isinstance(get_provider(), MockProvider)

    def test_explicit_mock(self, settings):
        from apps.ai.providers import get_provider, MockProvider
        settings.AI_PROVIDER = 'mock'
        assert isinstance(get_provider(), MockProvider)

    def test_unknown_provider_raises(self, settings):
        from apps.ai.providers import get_provider, LLMError
        settings.AI_PROVIDER = 'gpt5'
        with pytest.raises(LLMError):
            get_provider()
