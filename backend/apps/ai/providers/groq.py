"""
GroqProvider — Llama 3.3 70B via Groq's OpenAI-compatible API.

Free tier: 14,400 requests/day, no credit card required.
Sign up at https://console.groq.com to get an API key.
"""

from __future__ import annotations

import logging

import httpx
from django.conf import settings

from .base import CompletionResult, LLMError, LLMProvider

logger = logging.getLogger(__name__)

GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
DEFAULT_MODEL = 'llama-3.3-70b-versatile'
TIMEOUT_SECONDS = 30.0


class GroqProvider(LLMProvider):
    name = 'groq'

    def __init__(self, *, api_key: str | None = None, model: str | None = None) -> None:
        self.api_key = api_key or getattr(settings, 'GROQ_API_KEY', '')
        self.model = model or getattr(settings, 'GROQ_MODEL', DEFAULT_MODEL)
        if not self.api_key:
            raise LLMError(
                'GROQ_API_KEY not configured. Get a free key at '
                'https://console.groq.com (no credit card required).'
            )

    def complete(
        self,
        *,
        system: str,
        user: str,
        max_tokens: int = 1024,
        temperature: float = 0.2,
    ) -> CompletionResult:
        payload = {
            'model': self.model,
            'messages': [
                {'role': 'system', 'content': system},
                {'role': 'user', 'content': user},
            ],
            'max_tokens': max_tokens,
            'temperature': temperature,
            # Force JSON-only output so callers don't have to strip prose
            'response_format': {'type': 'json_object'},
        }
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
        }
        try:
            with httpx.Client(timeout=TIMEOUT_SECONDS) as client:
                resp = client.post(GROQ_URL, json=payload, headers=headers)
                resp.raise_for_status()
                data = resp.json()
        except httpx.HTTPError as exc:
            logger.exception('Groq request failed')
            raise LLMError(f'LLM request failed: {exc}') from exc

        try:
            content = data['choices'][0]['message']['content']
        except (KeyError, IndexError) as exc:
            raise LLMError(f'Unexpected Groq response shape: {data}') from exc

        return CompletionResult(
            content=content,
            model=data.get('model', self.model),
            usage=data.get('usage'),
        )
