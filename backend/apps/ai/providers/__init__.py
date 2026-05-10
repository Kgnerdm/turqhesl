"""Provider factory — driven by AI_PROVIDER env var."""

from __future__ import annotations

from django.conf import settings

from .base import CompletionResult, LLMError, LLMProvider
from .groq import GroqProvider
from .mock import MockProvider


def get_provider(name: str | None = None) -> LLMProvider:
    """Return a configured LLM provider.

    If AI_PROVIDER is unset and no GROQ_API_KEY is present, falls back to
    MockProvider so the endpoint stays responsive (returning an empty match
    list with an explanatory note).
    """
    selected = (name or getattr(settings, 'AI_PROVIDER', '')).lower()
    if not selected:
        selected = 'groq' if getattr(settings, 'GROQ_API_KEY', '') else 'mock'

    if selected == 'mock':
        return MockProvider()
    if selected == 'groq':
        try:
            return GroqProvider()
        except LLMError:
            # Bad config — degrade gracefully so the endpoint never 500s
            return MockProvider()
    raise LLMError(f'Unknown AI_PROVIDER: {selected!r}')


__all__ = ['LLMProvider', 'LLMError', 'CompletionResult', 'get_provider', 'MockProvider', 'GroqProvider']
