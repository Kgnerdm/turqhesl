from django.urls import path
from .views import (
    BookingListView,
    BookingDetailView,
    BookingCreateView,
    BookingDocumentSignedURLView,
    BookingDocumentUploadView,
    BookingStatusUpdateView,
    BookingCancelView,
    MyBookingsView,
    ProviderBookingsView,
    BookingStatsView,
)

app_name = 'bookings'

urlpatterns = [
    # List all bookings (filtered by role)
    path('', BookingListView.as_view(), name='booking-list'),
    
    # Create a new booking
    path('create/', BookingCreateView.as_view(), name='booking-create'),
    
    # Get booking statistics
    path('stats/', BookingStatsView.as_view(), name='booking-stats'),
    
    # My bookings (patient shortcut)
    path('my/', MyBookingsView.as_view(), name='my-bookings'),
    
    # Provider's bookings
    path('provider/', ProviderBookingsView.as_view(), name='provider-bookings'),
    
    # Single booking operations
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('<int:pk>/status/', BookingStatusUpdateView.as_view(), name='booking-status-update'),
    path('<int:pk>/cancel/', BookingCancelView.as_view(), name='booking-cancel'),

    # Private medical document upload (Cloudinary authenticated resource)
    path(
        '<int:pk>/upload-document/',
        BookingDocumentUploadView.as_view(),
        name='booking-document-upload',
    ),
    path(
        '<int:pk>/document-url/',
        BookingDocumentSignedURLView.as_view(),
        name='booking-document-signed-url',
    ),
]

