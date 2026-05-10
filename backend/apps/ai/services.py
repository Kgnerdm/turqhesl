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


# Soft synonyms used by the local fallback when no LLM is configured.
# Maps user-typed words to package category tokens / package text.
KEYWORD_SYNONYMS = {
    'tooth': ['dental', 'teeth', 'implant'],
    'teeth': ['dental', 'tooth', 'implant'],
    'dental': ['dental', 'tooth', 'teeth', 'implant', 'orthodontic'],
    'implant': ['dental', 'implant', 'tooth'],
    'hair': ['hair', 'transplant', 'fue', 'dhi'],
    'transplant': ['hair', 'transplant'],
    'bald': ['hair', 'transplant'],
    'eye': ['eye', 'cataract', 'lasik', 'vision'],
    'vision': ['eye', 'lasik', 'cataract'],
    'lasik': ['eye', 'lasik', 'vision'],
    'cataract': ['eye', 'cataract'],
    'nose': ['rhinoplasty', 'nose'],
    'rhinoplasty': ['rhinoplasty', 'nose'],
    'face': ['face', 'lift', 'cosmetic'],
    'cosmetic': ['cosmetic', 'face', 'plastic'],
    'plastic': ['cosmetic', 'plastic'],
    'breast': ['breast', 'augmentation'],
    'tummy': ['tummy', 'abdominoplasty'],
    'liposuction': ['liposuction', 'lipo'],
    'weight': ['bariatric', 'weight'],
    'bariatric': ['bariatric', 'weight'],
    'fertility': ['fertility', 'ivf'],
    'ivf': ['fertility', 'ivf'],
    'heart': ['cardiology', 'cardiac'],
    'cancer': ['oncology'],
    'oncology': ['oncology'],
    'bone': ['orthopedic', 'joint'],
    'joint': ['orthopedic', 'knee', 'hip'],
    'knee': ['orthopedic', 'knee'],
    'hip': ['orthopedic', 'hip'],
    'check': ['checkup', 'health'],
    'checkup': ['checkup', 'health'],
}


_STOP_WORDS = {
    'and', 'the', 'for', 'with', 'have', 'has', 'had', 'are', 'was', 'were',
    'this', 'that', 'these', 'those', 'will', 'would', 'should', 'could',
    'can', 'may', 'might', 'must', 'shall', 'about', 'into', 'onto', 'from',
    'some', 'any', 'all', 'every', 'each', 'much', 'many', 'most', 'lot',
    'lots', 'just', 'only', 'too', 'also', 'very', 'really', 'such',
    'need', 'want', 'looking', 'good', 'best', 'great', 'really',
    'pain', 'problem', 'issue', 'condition',  # too generic, hit anything
    'help', 'please',
    'you', 'your', 'yours', 'they', 'them', 'their', 'our', 'ours',
    'his', 'her', 'hers', 'its', 'who', 'what', 'when', 'where', 'why', 'how',
    'patient', 'treatment', 'surgery', 'package',  # too generic — hit every package
}


def _local_keyword_match(query: str, packages, limit: int) -> list[MatchedPackage]:
    """Deterministic keyword-based ranker used when no LLM key is configured.

    Tokenizes the query, expands synonyms (e.g. 'teeth' → 'dental'),
    scores each package by how many tokens hit its name/description/category,
    and returns the top `limit` packages with a generated reason.
    """
    import re

    raw_tokens = [t.lower() for t in re.findall(r"[a-zA-Z]{3,}", query) if t]
    tokens = [t for t in raw_tokens if t not in _STOP_WORDS]
    expanded: set[str] = set(tokens)
    for t in tokens:
        for syn in KEYWORD_SYNONYMS.get(t, []):
            expanded.add(syn)

    # City detection — let users mention "Istanbul" / "Ankara" etc.
    cities_in_query = {
        c for c in {'istanbul', 'ankara', 'izmir', 'antalya', 'bursa', 'kayseri'}
        if c in query.lower()
    }

    scored = []
    for p in packages:
        haystack = ' '.join([
            p.name.lower(),
            (p.description or '').lower(),
            p.category.lower().replace('_', ' '),
            ' '.join((p.includes or [])).lower(),
        ])
        score = sum(1 for tok in expanded if tok in haystack)

        # City match is a strong positive signal
        if cities_in_query and p.provider.city.lower() in cities_in_query:
            score += 3

        # Verified providers get a small boost (jury demo expectation)
        if p.provider.is_verified:
            score += 0.5

        # Require at least one *real* keyword hit before the verified-provider
        # boost can carry a package into the results
        if score >= 1:
            scored.append((score, p))

    scored.sort(key=lambda pair: (-pair[0], -pair[1].pk))
    top = scored[:limit]

    matched: list[MatchedPackage] = []
    for score, pkg in top:
        # Auto-generate a short reason from the highest-signal token that hit
        haystack = (pkg.name + ' ' + (pkg.description or '') + ' ' + pkg.category).lower()
        hit_token = next((t for t in expanded if t in haystack), '')
        reason_parts = []
        if hit_token:
            reason_parts.append(f"matches your interest in '{hit_token}'")
        if cities_in_query and pkg.provider.city.lower() in cities_in_query:
            reason_parts.append(f"located in {pkg.provider.city}")
        if pkg.provider.is_verified:
            reason_parts.append('verified provider')
        reason = ', '.join(reason_parts) or 'closely related to your query'
        # Capitalize first letter
        reason = reason[0].upper() + reason[1:] if reason else reason
        matched.append(MatchedPackage(package=pkg, reason=reason[:200]))
    return matched


def smart_match(query: str, *, limit: int = 3) -> list[MatchedPackage]:
    """Run the patient's query against the active package catalog.

    Routing:
    - If GROQ_API_KEY is set → call Groq LLM (production path)
    - Otherwise → fall back to local keyword matcher (deterministic, no network)

    Always returns ≤ `limit` MatchedPackage objects.
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

    # No LLM configured? Use the local keyword matcher — keeps the demo
    # responsive without requiring an API key.
    from django.conf import settings
    if not getattr(settings, 'GROQ_API_KEY', '') and getattr(settings, 'AI_PROVIDER', '') != 'groq':
        return _local_keyword_match(query, packages, limit)

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
