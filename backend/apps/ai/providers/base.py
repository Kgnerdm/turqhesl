"""
LLMProvider — abstraction over a chat-completion model.

Concrete implementations:
- GroqProvider — production default (free tier, fast Llama 3.3 70B)
- MockProvider — used in tests, returns canned JSON

Switching is controlled by the AI_PROVIDER environment variable.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


class LLMError(Exception):
    """Raised when the upstream model errors out, returns malformed JSON, etc."""


@dataclass(frozen=True)
class CompletionResult:
    """Whatever the model gave us back, plus debugging metadata."""
    content: str           # raw text response
    model: str = ''
    usage: dict | None = None  # token counts, when available


class LLMProvider(ABC):
    """Common interface every chat backend must implement."""

    name: str  # short identifier used by the factory

    @abstractmethod
    def complete(
        self,
        *,
        system: str,
        user: str,
        max_tokens: int = 1024,
        temperature: float = 0.2,
    ) -> CompletionResult:
        """Send a single user/system prompt pair and return the assistant message."""
        ...
