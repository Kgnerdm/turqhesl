"""
URL configuration for TurqHeal project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
"""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from apps.packages.views import ProviderPackagesView

urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),
    
    # API Documentation (Swagger/OpenAPI)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API endpoints
    path('api/', include('apps.core.urls', namespace='core')),
    path('api/auth/', include('apps.users.urls', namespace='users')),
    path('api/providers/', include('apps.providers.urls', namespace='providers')),
    path('api/packages/', include('apps.packages.urls', namespace='packages')),
    path('api/bookings/', include('apps.bookings.urls', namespace='bookings')),
    path('api/payments/', include('apps.payments.urls', namespace='payments')),
    path('api/packages/', include('apps.ai.urls', namespace='ai')),
    path('api/notifications/', include('apps.notifications.urls', namespace='notifications')),
    
    # Nested endpoint: provider's packages
    path('api/providers/<int:provider_id>/packages/', ProviderPackagesView.as_view(), name='provider-packages'),
]

