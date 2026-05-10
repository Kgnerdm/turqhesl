"""
In-app notification endpoints.

These power the bell icon in the customer/provider/admin navbar. The
frontend polls the list endpoint every few seconds and renders unread
items in a dropdown + toast.
"""

from __future__ import annotations

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(APIView):
    """
    GET /api/notifications/        — list (paginated by `limit`, default 20)
    GET /api/notifications/?unread=true — only unread

    Always scoped to request.user; cannot see other users' notifications.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Notification.objects.filter(user=request.user)
        if request.query_params.get('unread') == 'true':
            qs = qs.filter(is_read=False)

        try:
            limit = min(int(request.query_params.get('limit', 20)), 100)
        except ValueError:
            limit = 20

        items = list(qs[:limit])
        unread_count = Notification.objects.filter(
            user=request.user, is_read=False,
        ).count()

        return Response({
            'data': NotificationSerializer(items, many=True).data,
            'unread_count': unread_count,
        })


class NotificationMarkReadView(APIView):
    """POST /api/notifications/<id>/mark-read/  — mark a single notification read."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        notification = get_object_or_404(
            Notification, pk=pk, user=request.user,
        )
        notification.mark_read()
        return Response(NotificationSerializer(notification).data)


class NotificationMarkAllReadView(APIView):
    """POST /api/notifications/mark-all-read/  — bulk mark all unread as read."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        updated = Notification.objects.filter(
            user=request.user, is_read=False,
        ).update(is_read=True, read_at=timezone.now())
        return Response({'marked_read': updated})


class NotificationUnreadCountView(APIView):
    """GET /api/notifications/unread-count/  — cheap polling endpoint."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(
            user=request.user, is_read=False,
        ).count()
        return Response({'unread_count': count})
