"""
Views for the users app.

Handles user authentication endpoints: register, login, and profile.
"""

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
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
        serializer = UserSerializer(
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
        return Response(serializer.data)


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

