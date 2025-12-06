"""
Serializers for the providers app.
"""

from rest_framework import serializers

from apps.users.serializers import UserSerializer
from .models import Provider


class ProviderListSerializer(serializers.ModelSerializer):
    """
    Serializer for provider list view.
    
    Includes basic info and computed fields.
    """
    
    package_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Provider
        fields = [
            'id',
            'business_name',
            'description',
            'city',
            'phone',
            'email',
            'logo_url',
            'cover_image_url',
            'categories',
            'is_verified',
            'package_count',
            'created_at',
        ]
    
    def get_package_count(self, obj):
        """Get package count from annotation or property."""
        if hasattr(obj, 'active_package_count'):
            return obj.active_package_count
        return obj.package_count


class ProviderDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for provider detail view.
    
    Includes all fields and nested user info.
    """
    
    user = UserSerializer(read_only=True)
    package_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Provider
        fields = [
            'id',
            'user',
            'business_name',
            'description',
            'city',
            'address',
            'phone',
            'email',
            'website',
            'logo_url',
            'cover_image_url',
            'categories',
            'is_verified',
            'verification_date',
            'certificates',
            'working_hours',
            'images',
            'is_active',
            'package_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'is_verified',
            'verification_date',
            'created_at',
            'updated_at',
        ]
    
    def get_package_count(self, obj):
        """Get package count from annotation or property."""
        if hasattr(obj, 'active_package_count'):
            return obj.active_package_count
        return obj.package_count


class ProviderCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a provider profile.
    
    Used when a user with provider role creates their profile.
    """
    
    class Meta:
        model = Provider
        fields = [
            'business_name',
            'description',
            'city',
            'address',
            'phone',
            'email',
            'website',
            'logo_url',
            'cover_image_url',
            'categories',
            'certificates',
            'working_hours',
            'images',
        ]

    def validate_categories(self, value):
        """Ensure categories is a list."""
        if not isinstance(value, list):
            raise serializers.ValidationError('Categories must be a list.')
        return value

    def create(self, validated_data):
        """Create provider with the current user."""
        user = self.context['request'].user
        
        # Check if user already has a provider profile
        if hasattr(user, 'provider_profile'):
            raise serializers.ValidationError(
                {'detail': 'User already has a provider profile.'}
            )
        
        # Check if user has provider role
        if user.role != 'provider':
            raise serializers.ValidationError(
                {'detail': 'Only users with provider role can create a provider profile.'}
            )
        
        return Provider.objects.create(user=user, **validated_data)


class ProviderUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating a provider profile.
    """
    
    class Meta:
        model = Provider
        fields = [
            'business_name',
            'description',
            'city',
            'address',
            'phone',
            'email',
            'website',
            'logo_url',
            'cover_image_url',
            'categories',
            'certificates',
            'working_hours',
            'images',
        ]

    def validate_categories(self, value):
        """Ensure categories is a list."""
        if not isinstance(value, list):
            raise serializers.ValidationError('Categories must be a list.')
        return value


class ProviderVerifySerializer(serializers.Serializer):
    """
    Serializer for verifying a provider (admin only).
    """
    
    is_verified = serializers.BooleanField(required=True)

