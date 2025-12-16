"""
URL configuration for the providers app.
"""

from django.urls import path

from .views import (
    AdminPendingProvidersView,
    AdminRejectProviderView,
    AdminStatsView,
    MyProviderView,
    PlatformStatsView,
    ProviderCreateView,
    ProviderDetailView,
    ProviderListView,
    ProviderUpdateView,
    ProviderVerifyView,
)

app_name = 'providers'

urlpatterns = [
    # List and Create
    path('', ProviderListView.as_view(), name='list'),
    path('create/', ProviderCreateView.as_view(), name='create'),
    
    # Current user's provider profile
    path('me/', MyProviderView.as_view(), name='me'),
    
    # Public stats (no auth required)
    path('stats/public/', PlatformStatsView.as_view(), name='public-stats'),
    
    # Admin endpoints (must be before <int:pk>/ to avoid conflicts)
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/pending/', AdminPendingProvidersView.as_view(), name='admin-pending'),
    
    # Detail and Update
    path('<int:pk>/', ProviderDetailView.as_view(), name='detail'),
    path('<int:pk>/update/', ProviderUpdateView.as_view(), name='update'),
    
    # Admin actions
    path('<int:pk>/verify/', ProviderVerifyView.as_view(), name='verify'),
    path('<int:pk>/reject/', AdminRejectProviderView.as_view(), name='reject'),
]

