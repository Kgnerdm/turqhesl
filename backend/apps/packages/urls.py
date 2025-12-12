"""
URL configuration for the packages app.
"""

from django.urls import path

from .views import (
    MyPackagesView,
    PackageCreateView,
    PackageDeleteView,
    PackageDetailView,
    PackageListView,
    PackageUpdateView,
    PackageToggleStatusView,
)

app_name = 'packages'

urlpatterns = [
    # List and Create
    path('', PackageListView.as_view(), name='list'),
    path('create/', PackageCreateView.as_view(), name='create'),
    
    # Current provider's packages
    path('my/', MyPackagesView.as_view(), name='my'),
    
    # Detail, Update, Delete
    path('<int:pk>/', PackageDetailView.as_view(), name='detail'),
    path('<int:pk>/update/', PackageUpdateView.as_view(), name='update'),
    path('<int:pk>/delete/', PackageDeleteView.as_view(), name='delete'),
    path('<int:pk>/toggle-status/', PackageToggleStatusView.as_view(), name='toggle-status'),
]

