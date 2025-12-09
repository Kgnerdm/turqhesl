"""
URL configuration for the users app.

Authentication endpoints:
- POST /register/ - User registration
- POST /login/ - User login
- POST /logout/ - User logout
- POST /token/refresh/ - Refresh JWT token
- GET/PATCH /me/ - Current user profile
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import LoginView, LogoutView, MeView, RegisterView, ChangePasswordView

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
]

