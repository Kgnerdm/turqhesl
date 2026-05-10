"""
MockProvider — used in tests and as a fallback when no API key is configured.

Returns deterministic JSON so tests can assert against a stable shape.
"""

from __future__ import annotations

import json

from .base import CompletionResult, LLMProvider


class MockProvider(LLMProvider):
    name = 'mock'

    def __init__(self, *, canned_response: dict | None = None) -> None:
        self.canned_response = canned_response

    def complete(
        self,
        *,
        system: str,
        user: str,
        max_tokens: int = 1024,
        temperature: float = 0.2,
    ) -> CompletionResult:
        if self.canned_response is not None:
            content = json.dumps(self.canned_response)
        else:
            # Return a structurally valid empty match — useful when no
            # API key is configured but you still want the endpoint to respond.
            content = json.dumps({
                'matches': [],
                'note': 'AI provider is not configured. Configure GROQ_API_KEY to enable smart matching.',
            })
        return CompletionResult(content=content, model='mock')
