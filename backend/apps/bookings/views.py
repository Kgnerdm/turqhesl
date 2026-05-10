from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import Booking
from .serializers import (
    BookingListSerializer,
    BookingDetailSerializer,
    BookingCreateSerializer,
    BookingStatusUpdateSerializer,
    BookingCancelSerializer,
)
from apps.users.permissions import IsPatient, IsProvider, IsAdminUser


class BookingListView(generics.ListAPIView):
    """
    List bookings for the authenticated user.
    - Patients see their own bookings
    - Providers see bookings for their clinic
    - Admins see all bookings
    """
    serializer_class = BookingListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Booking.objects.select_related(
            'patient', 'provider', 'package'
        )
        
        # Filter based on user role
        if user.role == 'admin':
            pass  # Admin sees all
        elif user.role == 'provider':
            # Provider sees bookings for their clinic
            queryset = queryset.filter(provider__user=user)
        else:
            # Patient sees only their own bookings
            queryset = queryset.filter(patient=user)
        
        # Apply filters
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Date range filter
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(appointment_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(appointment_date__lte=end_date)
        
        return queryset.order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 10))
        
        total = queryset.count()
        start = (page - 1) * limit
        end = start + limit
        
        bookings = queryset[start:end]
        serializer = self.get_serializer(bookings, many=True)
        
        return Response({
            'data': serializer.data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'total_pages': (total + limit - 1) // limit,
                'has_next': end < total,
                'has_prev': page > 1,
            }
        })


class BookingDetailView(generics.RetrieveAPIView):
    """
    Get detailed booking information.
    Users can only view their own bookings (or provider's bookings).
    """
    serializer_class = BookingDetailSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Booking.objects.select_related(
            'patient', 'provider', 'package', 'provider__user'
        )
        
        if user.role == 'admin':
            return queryset
        elif user.role == 'provider':
            return queryset.filter(
                Q(provider__user=user) | Q(patient=user)
            )
        else:
            return queryset.filter(patient=user)


class BookingCreateView(generics.CreateAPIView):
    """
    Create a new booking.
    Only authenticated patients can create bookings.
    """
    serializer_class = BookingCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()

        # In-app notification: provider sees a new-booking bell entry
        from apps.notifications import services as notif_services
        notif_services.notify_new_booking_for_provider(booking)

        # Return the created booking with full details
        detail_serializer = BookingDetailSerializer(booking)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)


class BookingStatusUpdateView(APIView):
    """
    Update booking status.
    - Providers can confirm, start, complete, or cancel bookings
    - Admins can update any status
    """
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, pk):
        user = request.user
        
        # Get the booking
        if user.role == 'admin':
            booking = get_object_or_404(Booking, pk=pk)
        elif user.role == 'provider':
            booking = get_object_or_404(Booking, pk=pk, provider__user=user)
        else:
            return Response(
                {'detail': 'Only providers and admins can update booking status.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        previous_status = booking.status
        serializer = BookingStatusUpdateSerializer(
            booking,
            data=request.data,
            context={'booking': booking}
        )
        serializer.is_valid(raise_exception=True)
        updated_booking = serializer.save()

        # Trigger notifications based on the transition. We dispatch async via Celery.
        if updated_booking.status != previous_status:
            from apps.notifications.tasks import (
                send_booking_confirmed_email,
                send_booking_status_changed_email,
            )
            from apps.notifications import services as notif_services

            if updated_booking.status == Booking.Status.CONFIRMED:
                send_booking_confirmed_email.delay(updated_booking.id)
                notif_services.notify_booking_confirmed(updated_booking)
            else:
                send_booking_status_changed_email.delay(
                    updated_booking.id, previous_status
                )
                notif_services.notify_booking_status_changed(updated_booking, previous_status)

        return Response(BookingDetailSerializer(updated_booking).data)


class BookingCancelView(APIView):
    """
    Cancel a booking.
    - Patients can cancel their own pending/confirmed bookings
    - Providers can cancel any of their bookings
    - Admins can cancel any booking
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        user = request.user
        
        # Get the booking based on user role
        if user.role == 'admin':
            booking = get_object_or_404(Booking, pk=pk)
        elif user.role == 'provider':
            booking = get_object_or_404(
                Booking,
                Q(pk=pk) & (Q(provider__user=user) | Q(patient=user))
            )
        else:
            booking = get_object_or_404(Booking, pk=pk, patient=user)
        
        serializer = BookingCancelSerializer(
            booking,
            data=request.data,
            context={'booking': booking}
        )
        serializer.is_valid(raise_exception=True)
        cancelled_booking = serializer.save()

        # Notify both parties asynchronously (email) + in-app for the provider
        from apps.notifications.tasks import send_booking_cancelled_email
        from apps.notifications import services as notif_services
        send_booking_cancelled_email.delay(cancelled_booking.id)
        notif_services.notify_booking_cancelled_for_provider(cancelled_booking)

        return Response(BookingDetailSerializer(cancelled_booking).data)


class MyBookingsView(generics.ListAPIView):
    """
    List current user's bookings (shortcut for patients).
    """
    serializer_class = BookingListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Booking.objects.filter(
            patient=self.request.user
        ).select_related('provider', 'package').order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Apply status filter
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 10))
        
        total = queryset.count()
        start = (page - 1) * limit
        end = start + limit
        
        bookings = queryset[start:end]
        serializer = self.get_serializer(bookings, many=True)
        
        return Response({
            'data': serializer.data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'total_pages': (total + limit - 1) // limit,
                'has_next': end < total,
                'has_prev': page > 1,
            }
        })


class ProviderBookingsView(generics.ListAPIView):
    """
    List bookings for the current provider.
    """
    serializer_class = BookingListSerializer
    permission_classes = [IsAuthenticated, IsProvider]
    
    def get_queryset(self):
        return Booking.objects.filter(
            provider__user=self.request.user
        ).select_related('patient', 'package').order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Apply status filter
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Apply date filter
        date_filter = request.query_params.get('date')
        if date_filter:
            queryset = queryset.filter(appointment_date=date_filter)
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 10))
        
        total = queryset.count()
        start = (page - 1) * limit
        end = start + limit
        
        bookings = queryset[start:end]
        serializer = self.get_serializer(bookings, many=True)
        
        return Response({
            'data': serializer.data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'total_pages': (total + limit - 1) // limit,
                'has_next': end < total,
                'has_prev': page > 1,
            }
        })


class BookingStatsView(APIView):
    """
    Get booking statistics.
    - Providers see their clinic stats
    - Admins see platform-wide stats
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        if user.role == 'admin':
            queryset = Booking.objects.all()
        elif user.role == 'provider':
            queryset = Booking.objects.filter(provider__user=user)
        else:
            queryset = Booking.objects.filter(patient=user)
        
        stats = {
            'total': queryset.count(),
            'pending': queryset.filter(status=Booking.Status.PENDING).count(),
            'confirmed': queryset.filter(status=Booking.Status.CONFIRMED).count(),
            'in_progress': queryset.filter(status=Booking.Status.IN_PROGRESS).count(),
            'completed': queryset.filter(status=Booking.Status.COMPLETED).count(),
            'cancelled': queryset.filter(status=Booking.Status.CANCELLED).count(),
        }
        
        # Calculate total revenue for providers/admins
        if user.role in ['admin', 'provider']:
            from django.db.models import Sum
            completed_bookings = queryset.filter(
                status=Booking.Status.COMPLETED,
                payment_status=Booking.PaymentStatus.PAID
            )
            total_revenue = completed_bookings.aggregate(
                total=Sum('total_price')
            )['total'] or 0
            stats['total_revenue'] = float(total_revenue)
        
        return Response(stats)



# ----------------------------------------------------------------------
# Cloudinary document upload (private, signed URL)
# ----------------------------------------------------------------------

from django.utils import timezone
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from apps.core.storage import (
    StorageError,
    delete_resource,
    signed_document_url,
    upload_document,
)


class BookingDocumentUploadView(APIView):
    """
    POST /api/bookings/<id>/upload-document/
    multipart/form-data with field 'file'

    Upload a private medical document. Storage uses Cloudinary's
    'authenticated' resource type, so delivery requires a signed URL.

    DELETE /api/bookings/<id>/upload-document/
    body: { "public_id": "..." }
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def _resolve_booking(self, request, pk):
        user = request.user
        if user.role == 'admin':
            return Booking.objects.filter(pk=pk).first()
        if user.role == 'provider':
            return Booking.objects.filter(pk=pk, provider__user=user).first()
        return Booking.objects.filter(pk=pk, patient=user).first()

    def post(self, request, pk):
        booking = self._resolve_booking(request, pk)
        if booking is None:
            return Response(
                {'detail': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response(
                {'detail': 'No file uploaded. Use field name "file".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            asset = upload_document(
                file_obj,
                folder=f'turqheal/bookings/{booking.pk}/documents',
                content_type=file_obj.content_type,
                tags=[f'booking_{booking.pk}', 'medical_document'],
            )
        except StorageError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        documents = list(booking.documents) if isinstance(booking.documents, list) else []
        documents.append({
            'public_id': asset.public_id,
            'filename': getattr(file_obj, 'name', ''),
            'bytes': asset.bytes,
            'uploaded_at': timezone.now().isoformat(),
            'uploaded_by': request.user.id,
        })
        booking.documents = documents
        booking.save(update_fields=['documents', 'updated_at'])

        return Response(
            {
                'public_id': asset.public_id,
                'filename': getattr(file_obj, 'name', ''),
                'bytes': asset.bytes,
            },
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request, pk):
        booking = self._resolve_booking(request, pk)
        if booking is None:
            return Response(
                {'detail': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        public_id = request.data.get('public_id')
        if not public_id:
            return Response(
                {'detail': 'Field "public_id" is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        documents = list(booking.documents) if isinstance(booking.documents, list) else []
        if not any(d.get('public_id') == public_id for d in documents):
            return Response(
                {'detail': 'Document not found on this booking.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            delete_resource(public_id, resource_type='raw')
        except StorageError:
            pass  # still remove from DB even if CDN delete fails

        booking.documents = [d for d in documents if d.get('public_id') != public_id]
        booking.save(update_fields=['documents', 'updated_at'])

        return Response(status=status.HTTP_204_NO_CONTENT)


class BookingDocumentSignedURLView(APIView):
    """
    GET /api/bookings/<id>/document-url/?public_id=...

    Returns a short-lived signed URL (15-minute TTL) for a private document.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        user = request.user
        if user.role == 'admin':
            booking = Booking.objects.filter(pk=pk).first()
        elif user.role == 'provider':
            booking = Booking.objects.filter(pk=pk, provider__user=user).first()
        else:
            booking = Booking.objects.filter(pk=pk, patient=user).first()

        if booking is None:
            return Response(
                {'detail': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        public_id = request.query_params.get('public_id')
        if not public_id:
            return Response(
                {'detail': 'Query param "public_id" is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        documents = booking.documents if isinstance(booking.documents, list) else []
        if not any(d.get('public_id') == public_id for d in documents):
            return Response(
                {'detail': 'Document not found on this booking.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            url = signed_document_url(public_id, expires_in_seconds=900)
        except StorageError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'url': url, 'expires_in_seconds': 900})
