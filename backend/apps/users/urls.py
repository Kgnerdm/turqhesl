"""
URL configuration for the users app.

Authentication endpoints:
- POST /register/ - User registration
- POST /login/ - User login
- POST /logout/ - User logout
- POST /token/refresh/ - Refresh JWT token
- GET/PATCH /me/ - Current user profile

Admin endpoints:
- GET /admin/stats/ - User statistics
- GET /admin/users/ - List users
- GET /admin/users/:id/ - User detail
- PATCH /admin/users/:id/ - Update user
- DELETE /admin/users/:id/ - Delete user
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    LoginView,
    LogoutView,
    MeView,
    RegisterView,
    ChangePasswordView,
    AdminUserStatsView,
    AdminUserListView,
    AdminUserDetailView,
)

app_name = 'users'

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile
    path('me/', MeView.as_view(), name='me'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Admin - User Management
    path('admin/stats/', AdminUserStatsView.as_view(), name='admin_user_stats'),
    path('admin/users/', AdminUserListView.as_view(), name='admin_user_list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
]

