"""SmartMatch endpoint."""

from __future__ import annotations

from rest_framework import status, serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.packages.serializers import PackageListSerializer

from .services import smart_match


class SmartMatchSerializer(serializers.Serializer):
    """Body for POST /api/packages/smart-match/."""
    query = serializers.CharField(min_length=3, max_length=500)


class SmartMatchView(APIView):
    """
    POST /api/packages/smart-match/
    body: { "query": "I need dental implants and I'd prefer Istanbul" }

    Public endpoint (so prospects can try before signup), rate-limited to 10/min/IP.
    Returns:
        {
          "matches": [
            { "package": {...}, "reason": "..." }, ...
          ]
        }
    """

    permission_classes = [AllowAny]
    throttle_scope = 'ai'

    def post(self, request):
        serializer = SmartMatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        query = serializer.validated_data['query']

        matches = smart_match(query, limit=3)

        return Response({
            'matches': [
                {
                    'package': PackageListSerializer(m.package).data,
                    'reason': m.reason,
                }
                for m in matches
            ],
        }, status=status.HTTP_200_OK)
