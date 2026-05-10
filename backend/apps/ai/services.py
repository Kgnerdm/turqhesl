"""
SmartMatch service.

Builds a system prompt + user prompt from the patient's free-text query and
the catalog of active packages, asks the configured LLM to pick the best 3,
and validates the JSON response before returning it.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass

from apps.packages.models import Package

from .providers import LLMError, get_provider

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """You are a medical tourism advisor for TurqHeal, a marketplace
that connects international patients with verified healthcare providers in Turkey.

Given a patient's free-text description of their needs and a JSON catalog of
available treatment packages, pick the THREE best matches.

Rules:
1. Recommend ONLY packages from the provided catalog. Never invent packages.
2. Return JSON only, no prose, no markdown code fences.
3. Schema:
   {
     "matches": [
       {
         "package_id": <int>,
         "reason": "<one short sentence, max 140 chars, explaining why this matches>"
       }
     ]
   }
4. If the catalog is empty or no package matches at all, return {"matches": []}.
5. Reasons must be patient-friendly, no clinical jargon, no diagnosis claims.
6. Never recommend a treatment for a condition that is not mentioned or
   strongly implied by the patient. Err toward fewer matches over wrong ones.
7. Do not provide medical advice. The "reason" describes fit with the package
   description, not whether the patient should pursue treatment.
"""


@dataclass(frozen=True)
class MatchedPackage:
    package: Package
    reason: str


def _serialize_packages_for_prompt(packages: list[Package]) -> str:
    """Cheap, dense representation of the catalog. Keep it short — token budget."""
    items = []
    for p in packages:
        items.append({
            'id': p.pk,
            'name': p.name,
            'category': p.category,
            'description': (p.description or '')[:300],
            'duration': p.duration,
            'price_usd': str(p.price) if p.currency == 'USD' else f'{p.price} {p.currency}',
            'city': p.provider.city,
            'verified': p.provider.is_verified,
            'includes': (p.includes or [])[:5],  # cap to keep prompt small
        })
    return json.dumps(items, ensure_ascii=False)


def smart_match(query: str, *, limit: int = 3) -> list[MatchedPackage]:
    """Run the patient's query against the active package catalog.

    Returns at most `limit` MatchedPackage objects in priority order. May
    return an empty list if no package matches or if the AI provider isn't
    configured (in that case the mock provider returns an explanatory note).
    """
    query = (query or '').strip()
    if not query:
        return []

    packages = list(
        Package.objects.filter(is_active=True)
        .select_related('provider')
        .order_by('-id')[:50]   # cap for token budget; recent + active only
    )
    if not packages:
        return []

    by_id = {p.pk: p for p in packages}
    catalog_json = _serialize_packages_for_prompt(packages)

    user_prompt = (
        f'Patient says: "{query}"\n\n'
        f'Available packages (JSON):\n{catalog_json}\n\n'
        f'Pick the top {limit} matches.'
    )

    provider = get_provider()
    try:
        result = provider.complete(
            system=SYSTEM_PROMPT,
            user=user_prompt,
            max_tokens=600,
            temperature=0.2,
        )
    except LLMError:
        logger.exception('SmartMatch LLM call failed')
        return []

    try:
        parsed = json.loads(result.content)
    except json.JSONDecodeError:
        logger.warning('SmartMatch: model returned non-JSON: %r', result.content[:200])
        return []

    raw_matches = parsed.get('matches', [])
    if not isinstance(raw_matches, list):
        return []

    matched: list[MatchedPackage] = []
    for entry in raw_matches[:limit]:
        if not isinstance(entry, dict):
            continue
        pid = entry.get('package_id')
        reason = entry.get('reason') or ''
        try:
            pid_int = int(pid)
        except (TypeError, ValueError):
            continue
        package = by_id.get(pid_int)
        if package is None:
            # Hallucinated id — skip
            continue
        matched.append(MatchedPackage(
            package=package,
            reason=str(reason)[:200],  # safety cap
        ))

    return matched
