"""
Thin wrapper around Django's email + template system.

Used by Celery tasks. Keeping this separate makes it trivial to mock
in tests without touching the task layer.
"""

from __future__ import annotations

import logging
from typing import Any

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


def render_and_send(
    *,
    template_base: str,
    subject: str,
    to: list[str] | str,
    context: dict[str, Any] | None = None,
    from_email: str | None = None,
) -> int:
    """
    Render `<template_base>.txt` and `<template_base>.html` (the latter is optional)
    from the notifications app templates and send the resulting email.

    Returns the number of successfully delivered messages (0 or 1).
    """
    if isinstance(to, str):
        to = [to]
    if not to:
        return 0

    ctx = {
        'frontend_url': settings.FRONTEND_URL,
        **(context or {}),
    }

    text_body = render_to_string(f'notifications/emails/{template_base}.txt', ctx)
    try:
        html_body: str | None = render_to_string(
            f'notifications/emails/{template_base}.html', ctx
        )
    except Exception:
        html_body = None  # html template optional

    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=from_email or settings.DEFAULT_FROM_EMAIL,
        to=list(to),
    )
    if html_body:
        msg.attach_alternative(html_body, 'text/html')

    sent = msg.send(fail_silently=False)
    logger.info('email sent template=%s to=%s sent=%s', template_base, to, sent)
    return sent
