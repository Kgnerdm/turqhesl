"""
Serializers for the users app.

Handles user registration, login, and profile serialization.
"""

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, UserRole


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.
    
    Used for displaying user information in responses.
    Excludes sensitive fields like password.
    """

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'role',
            'phone',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'is_active', 'created_at', 'updated_at']


class RegisterSerializer(serializers.Serializer):
    """
    Serializer for user registration.
    
    Validates registration data and creates a new user.
    Only allows 'patient' or 'provider' roles (not 'admin').
    """

    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
    )
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)
    role = serializers.ChoiceField(
        choices=[
            (UserRole.PATIENT, 'Patient'),
            (UserRole.PROVIDER, 'Provider'),
        ],
        default=UserRole.PATIENT,
    )
    phone = serializers.CharField(required=False, allow_blank=True, max_length=20)

    def validate_email(self, value):
        """
        Check that the email is not already in use.
        """
        email = value.lower()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return email

    def validate_password(self, value):
        """
        Validate password using Django's password validators.
        """
        validate_password(value)
        return value

    def validate(self, attrs):
        """
        Check that the two password entries match.
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        return attrs

    def create(self, validated_data):
        """
        Create and return a new user instance.
        """
        # Remove password_confirm from the data
        validated_data.pop('password_confirm')
        
        # Create the user
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=validated_data.get('role', UserRole.PATIENT),
            phone=validated_data.get('phone'),
        )
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    
    Validates credentials and returns user data if valid.
    """

    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
    )

    def validate(self, attrs):
        """
        Validate user credentials.
        """
        email = attrs.get('email', '').lower()
        password = attrs.get('password', '')

        if not email or not password:
            raise serializers.ValidationError('Both email and password are required.')

        # Authenticate the user
        user = authenticate(
            request=self.context.get('request'),
            username=email,  # Django uses username internally
            password=password,
        )

        if not user:
            raise serializers.ValidationError({
                'detail': 'Invalid credentials.'
            })

        if not user.is_active:
            raise serializers.ValidationError({
                'detail': 'User account is disabled.'
            })

        attrs['user'] = user
        return attrs


class TokenResponseSerializer(serializers.Serializer):
    """
    Serializer for token response structure.
    
    Used for API documentation purposes.
    """

    access = serializers.CharField(help_text='JWT access token')
    refresh = serializers.CharField(help_text='JWT refresh token')


class AuthResponseSerializer(serializers.Serializer):
    """
    Serializer for authentication response.
    
    Includes both user data and tokens.
    """

    user = UserSerializer()
    tokens = TokenResponseSerializer()


class UpdateProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile.
    
    Only allows updating non-sensitive fields.
    """

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone']

    def validate_first_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('First name cannot be empty.')
        return value.strip()

    def validate_last_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Last name cannot be empty.')
        return value.strip()


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change.
    
    Validates current password and new password.
    """

    current_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
    )

    def validate_current_password(self, value):
        """Check that the current password is correct."""
        user = self.context.get('request').user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value

    def validate_new_password(self, value):
        """Validate new password using Django's password validators."""
        validate_password(value)
        return value

    def validate(self, attrs):
        """Check that new password and confirm password match."""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'New passwords do not match.'
            })
        return attrs

    def save(self):
        """Update the user's password."""
        user = self.context.get('request').user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


def get_tokens_for_user(user):
    """
    Generate JWT tokens for a user.
    
    Args:
        user: User instance
        
    Returns:
        dict: Contains 'access' and 'refresh' tokens
    """
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }

