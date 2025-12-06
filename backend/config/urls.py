"""
URL configuration for TurqHeal project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
"""

from django.contrib import admin
from django.urls import include, path

from apps.packages.views import ProviderPackagesView

urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/auth/', include('apps.users.urls', namespace='users')),
    path('api/providers/', include('apps.providers.urls', namespace='providers')),
    path('api/packages/', include('apps.packages.urls', namespace='packages')),
    
    # Nested endpoint: provider's packages
    path('api/providers/<int:provider_id>/packages/', ProviderPackagesView.as_view(), name='provider-packages'),
]

