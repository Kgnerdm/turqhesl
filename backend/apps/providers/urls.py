"""
URL configuration for the providers app.
"""

from django.urls import path

from .views import (
    MyProviderView,
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
    
    # Detail and Update
    path('<int:pk>/', ProviderDetailView.as_view(), name='detail'),
    path('<int:pk>/update/', ProviderUpdateView.as_view(), name='update'),
    
    # Admin actions
    path('<int:pk>/verify/', ProviderVerifyView.as_view(), name='verify'),
]

