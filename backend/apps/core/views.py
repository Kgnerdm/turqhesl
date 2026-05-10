"""
Health check endpoint.

Used by load balancers, uptime monitors, and the deployment platform to
verify that the API and its critical dependencies (database, Redis broker)
are reachable. Returns 200 when everything is up, 503 otherwise.
"""

from __future__ import annotations

import logging
import time

from django.conf import settings
from django.db import connection
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)


class HealthCheckView(APIView):
    """GET /api/health/  — fast readiness probe.

    Public, never throttled. Reports status of:
    - Database (cheap SELECT 1)
    - Redis broker (ping)
    """

    permission_classes = [AllowAny]
    throttle_classes = []  # never rate-limit health checks
    authentication_classes = []  # no auth header parsing overhead

    def get(self, request):
        started = time.monotonic()
        db_ok = self._check_database()
        redis_ok = self._check_redis()
        elapsed_ms = int((time.monotonic() - started) * 1000)

        all_ok = db_ok and redis_ok
        return Response(
            {
                'status': 'ok' if all_ok else 'degraded',
                'checks': {
                    'database': 'ok' if db_ok else 'error',
                    'redis': 'ok' if redis_ok else 'error',
                },
                'response_time_ms': elapsed_ms,
            },
            status=status.HTTP_200_OK if all_ok else status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    @staticmethod
    def _check_database() -> bool:
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1')
                cursor.fetchone()
            return True
        except Exception:
            logger.exception('health: database check failed')
            return False

    @staticmethod
    def _check_redis() -> bool:
        try:
            import redis as redis_lib
            broker_url = getattr(settings, 'CELERY_BROKER_URL', '')
            if not broker_url:
                return False
            client = redis_lib.from_url(broker_url, socket_connect_timeout=2, socket_timeout=2)
            client.ping()
            return True
        except Exception:
            logger.exception('health: redis check failed')
            return False
