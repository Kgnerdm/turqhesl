"""
Views for the users app.

Handles user authentication endpoints: register, login, and profile.
"""

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .permissions import IsAdminUser
from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
    UpdateProfileSerializer,
    ChangePasswordSerializer,
    AdminUserSerializer,
    AdminUserUpdateSerializer,
    get_tokens_for_user,
)


class RegisterView(APIView):
    """
    API endpoint for user registration.
    
    POST /api/auth/register/
    
    Creates a new user account and returns user data with JWT tokens.
    Only 'patient' and 'provider' roles are allowed during registration.
    
    Request Body:
        - email: User's email address (required, unique)
        - password: User's password (required)
        - password_confirm: Password confirmation (required, must match password)
        - first_name: User's first name (required)
        - last_name: User's last name (required)
        - role: User's role - 'patient' or 'provider' (optional, default: 'patient')
        - phone: User's phone number (optional)
    
    Response (201):
        - user: User object
        - tokens: { access, refresh }
    """

    permission_classes = [AllowAny]

    def post(self, request):
        """Handle user registration."""
        serializer = RegisterSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the user
        user = serializer.save()
        
        # Generate tokens
        tokens = get_tokens_for_user(user)
        
        # Serialize user data
        user_data = UserSerializer(user).data
        
        return Response(
            {
                'user': user_data,
                'tokens': tokens,
            },
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    """
    API endpoint for user login.
    
    POST /api/auth/login/
    
    Authenticates a user and returns user data with JWT tokens.
    
    Request Body:
        - email: User's email address (required)
        - password: User's password (required)
    
    Response (200):
        - user: User object
        - tokens: { access, refresh }
    """

    permission_classes = [AllowAny]

    def post(self, request):
        """Handle user login."""
        serializer = LoginSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            # Check if it's a credential error
            if 'detail' in serializer.errors:
                return Response(
                    {'detail': serializer.errors['detail'][0]},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the authenticated user
        user = serializer.validated_data['user']
        
        # Generate tokens
        tokens = get_tokens_for_user(user)
        
        # Serialize user data
        user_data = UserSerializer(user).data
        
        return Response(
            {
                'user': user_data,
                'tokens': tokens,
            },
            status=status.HTTP_200_OK
        )


class MeView(APIView):
    """
    API endpoint for current user profile.
    
    GET /api/auth/me/
    
    Returns the authenticated user's profile data.
    
    Response (200):
        - User object
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get current user's profile."""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        """
        Update current user's profile.
        
        Allows partial update of user profile fields.
        Cannot update email, role, or sensitive fields.
        """
        serializer = UpdateProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        # Return full user data
        return Response(UserSerializer(request.user).data)


class LogoutView(APIView):
    """
    API endpoint for user logout.
    
    POST /api/auth/logout/
    
    Blacklists the refresh token to logout the user.
    
    Request Body:
        - refresh: Refresh token to blacklist (required)
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Handle user logout by blacklisting the refresh token."""
        try:
            from rest_framework_simplejwt.tokens import RefreshToken
            
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'detail': 'Refresh token is required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response(
                {'detail': 'Successfully logged out.'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'detail': 'Invalid token.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ChangePasswordView(APIView):
    """
    API endpoint for changing password.
    
    POST /api/auth/change-password/
    
    Changes the user's password after validating current password.
    
    Request Body:
        - current_password: Current password (required)
        - new_password: New password (required)
        - confirm_password: New password confirmation (required)
    
    Response (200):
        - detail: Success message
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Handle password change."""
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        
        return Response(
            {'detail': 'Password changed successfully.'},
            status=status.HTTP_200_OK
        )


# ============================================
# ADMIN VIEWS
# ============================================

class AdminUserListView(APIView):
    """
    API endpoint for admin to list all users.
    
    GET /api/auth/admin/users/
    
    Query Parameters:
        - role: Filter by role (patient, provider, admin)
        - is_active: Filter by active status (true/false)
        - search: Search in email, first_name, last_name
        - page: Page number (default: 1)
        - limit: Items per page (default: 10)
    """
    
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """List all users with optional filters."""
        queryset = User.objects.all()
        
        # Apply filters
        role = request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        
        is_active = request.query_params.get('is_active')
        if is_active is not None:
            is_active_bool = is_active.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_active=is_active_bool)
        
        search = request.query_params.get('search')
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        # Ordering
        sort_by = request.query_params.get('sort_by', 'newest')
        if sort_by == 'email':
            queryset = queryset.order_by('email')
        elif sort_by == 'name':
            queryset = queryset.order_by('first_name', 'last_name')
        else:  # newest (default)
            queryset = queryset.order_by('-created_at')
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 10))
        offset = (page - 1) * limit
        
        total = queryset.count()
        users = queryset[offset:offset + limit]
        
        serializer = AdminUserSerializer(users, many=True)
        
        return Response({
            'data': serializer.data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'total_pages': (total + limit - 1) // limit,
                'has_next': offset + limit < total,
                'has_prev': page > 1,
            }
        })


class AdminUserDetailView(APIView):
    """
    API endpoint for admin to view/update/delete a user.
    
    GET /api/auth/admin/users/:id/
    PATCH /api/auth/admin/users/:id/
    DELETE /api/auth/admin/users/:id/
    """
    
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request, pk):
        """Get user details by ID."""
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AdminUserSerializer(user)
        return Response(serializer.data)
    
    def patch(self, request, pk):
        """Update user details."""
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Prevent admin from deactivating themselves
        if user == request.user and request.data.get('is_active') == False:
            return Response(
                {'detail': 'You cannot deactivate your own account.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = AdminUserUpdateSerializer(
            user,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        return Response(AdminUserSerializer(user).data)
    
    def delete(self, request, pk):
        """Delete a user (soft delete by deactivating)."""
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Prevent admin from deleting themselves
        if user == request.user:
            return Response(
                {'detail': 'You cannot delete your own account.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Soft delete - deactivate the user
        user.is_active = False
        user.save()
        
        return Response(
            {'detail': 'User has been deactivated.'},
            status=status.HTTP_200_OK
        )


class AdminUserStatsView(APIView):
    """
    API endpoint for user statistics (admin only).
    
    GET /api/auth/admin/stats/
    """
    
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """Get user statistics."""
        from django.db.models import Count
        from django.utils import timezone
        from datetime import timedelta
        
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        
        # Users by role
        role_stats = User.objects.values('role').annotate(count=Count('id'))
        role_counts = {stat['role']: stat['count'] for stat in role_stats}
        
        # New users in last 7 days
        week_ago = timezone.now() - timedelta(days=7)
        new_users_week = User.objects.filter(created_at__gte=week_ago).count()
        
        # New users in last 30 days
        month_ago = timezone.now() - timedelta(days=30)
        new_users_month = User.objects.filter(created_at__gte=month_ago).count()
        
        return Response({
            'total': total_users,
            'active': active_users,
            'inactive': total_users - active_users,
            'by_role': {
                'patient': role_counts.get('patient', 0),
                'provider': role_counts.get('provider', 0),
                'admin': role_counts.get('admin', 0),
            },
            'new_this_week': new_users_week,
            'new_this_month': new_users_month,
        })

