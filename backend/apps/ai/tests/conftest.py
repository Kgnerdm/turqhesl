"""
Local fixtures for AI tests.

We force the LLM-provider code path by setting a dummy GROQ_API_KEY +
patching get_provider to return MockProvider with canned responses.
This isolates the LLM contract tests from the local keyword fallback.
"""

import pytest


@pytest.fixture(autouse=True)
def _force_llm_path(settings):
    settings.GROQ_API_KEY = 'test-dummy-key'
    settings.AI_PROVIDER = ''  # let the auto-detection see the key
