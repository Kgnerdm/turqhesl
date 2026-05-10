"""
Tests for the local keyword matcher (used when no LLM is configured).

These tests intentionally do NOT use the autouse fixture from conftest.py
that forces the LLM path — we override it here so the matcher runs.
"""

from __future__ import annotations

import pytest

from apps.ai.services import _local_keyword_match, smart_match
from apps.tests.factories import PackageFactory, VerifiedProviderFactory


pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def _no_llm(settings):
    """Override the conftest fixture to disable the LLM path."""
    settings.GROQ_API_KEY = ''
    settings.AI_PROVIDER = 'mock'  # would route to mock if we let it


class TestLocalMatcher:
    def test_dental_query_matches_dental_packages(self, db):
        provider = VerifiedProviderFactory(city='Istanbul')
        dental = PackageFactory(provider=provider, name='Premium Dental Implants', category='dental')
        PackageFactory(provider=provider, name='LASIK Eye Surgery', category='eye_surgery')

        result = smart_match('I need dental implants in Istanbul')
        assert any(m.package.id == dental.id for m in result)

    def test_synonym_expansion(self, db):
        """'teeth' should match dental packages even though the catalog says 'dental'."""
        provider = VerifiedProviderFactory()
        dental = PackageFactory(provider=provider, name='Hollywood Smile', category='dental')

        result = smart_match('I want to fix my teeth')
        assert any(m.package.id == dental.id for m in result)

    def test_city_boost(self, db):
        ist = VerifiedProviderFactory(city='Istanbul')
        ank = VerifiedProviderFactory(city='Ankara')
        ist_pkg = PackageFactory(provider=ist, name='Hair Transplant Premium', category='hair_transplant')
        PackageFactory(provider=ank, name='Hair Transplant Standard', category='hair_transplant')

        result = smart_match('hair transplant in Istanbul')
        assert result[0].package.id == ist_pkg.id

    def test_stop_words_dont_match(self, db):
        """'pain' alone shouldn't match any package — too generic."""
        provider = VerifiedProviderFactory()
        PackageFactory(provider=provider, name='Cardiac Surgery', category='cardiology')

        result = smart_match('I have pain')  # no real signal
        assert result == []

    def test_no_signal_returns_empty(self, db):
        provider = VerifiedProviderFactory()
        PackageFactory(provider=provider, name='Dental Implant', category='dental')

        result = smart_match('hello world how are you')
        assert result == []

    def test_returns_at_most_three(self, db):
        provider = VerifiedProviderFactory()
        for i in range(5):
            PackageFactory(provider=provider, name=f'Dental {i}', category='dental')

        result = smart_match('I need dental work done')
        assert len(result) <= 3

    def test_reason_mentions_keyword(self, db):
        provider = VerifiedProviderFactory()
        PackageFactory(provider=provider, name='Hair Transplant', category='hair_transplant')

        result = smart_match('hair transplant please')
        assert result, 'expected at least one match'
        assert any(t in result[0].reason.lower() for t in ('hair', 'transplant'))

    def test_empty_query(self, db):
        VerifiedProviderFactory()
        assert smart_match('') == []
        assert smart_match('   ') == []
