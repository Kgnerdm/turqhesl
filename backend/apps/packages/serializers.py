"""
Serializers for the packages app.
"""

from rest_framework import serializers

from apps.providers.serializers import ProviderListSerializer
from .models import Package, PackageCategory, Favorite


class PackageListSerializer(serializers.ModelSerializer):
    """
    Serializer for package list view.
    
    Includes basic info and provider summary.
    """
    
    provider_name = serializers.CharField(source='provider.business_name', read_only=True)
    provider_city = serializers.CharField(source='provider.city', read_only=True)
    provider_is_verified = serializers.BooleanField(source='provider.is_verified', read_only=True)
    category_display = serializers.CharField(read_only=True)
    
    class Meta:
        model = Package
        fields = [
            'id',
            'name',
            'description',
            'category',
            'category_display',
            'price',
            'currency',
            'duration',
            'includes',
            'images',
            'is_featured',
            'provider',
            'provider_name',
            'provider_city',
            'provider_is_verified',
            'created_at',
        ]


class PackageDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for package detail view.
    
    Includes all fields and full provider info.
    """
    
    provider = ProviderListSerializer(read_only=True)
    category_display = serializers.CharField(read_only=True)
    
    class Meta:
        model = Package
        fields = [
            'id',
            'name',
            'description',
            'category',
            'category_display',
            'price',
            'currency',
            'duration',
            'includes',
            'excludes',
            'images',
            'is_active',
            'is_featured',
            'booking_count',
            'provider',
            'created_at',
            'updated_at',
        ]


class PackageCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a package.
    
    Provider is automatically set to the current user's provider.
    """
    
    class Meta:
        model = Package
        fields = [
            'name',
            'description',
            'category',
            'price',
            'currency',
            'duration',
            'includes',
            'excludes',
            'images',
        ]

    def validate_includes(self, value):
        """Ensure includes is a list."""
        if not isinstance(value, list):
            raise serializers.ValidationError('Includes must be a list.')
        return value

    def validate_excludes(self, value):
        """Ensure excludes is a list."""
        if not isinstance(value, list):
            raise serializers.ValidationError('Excludes must be a list.')
        return value

    def validate_images(self, value):
        """Ensure images is a list."""
        if not isinstance(value, list):
            raise serializers.ValidationError('Images must be a list.')
        return value

    def create(self, validated_data):
        """Create package with the current user's provider."""
        user = self.context['request'].user
        
        # Get user's provider profile
        if not hasattr(user, 'provider_profile'):
            raise serializers.ValidationError(
                {'detail': 'You must create a provider profile first.'}
            )
        
        provider = user.provider_profile
        return Package.objects.create(provider=provider, **validated_data)


class PackageUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating a package.
    """
    
    class Meta:
        model = Package
        fields = [
            'name',
            'description',
            'category',
            'price',
            'currency',
            'duration',
            'includes',
            'excludes',
            'images',
            'is_active',
        ]

    def validate_includes(self, value):
        """Ensure includes is a list."""
        if value is not None and not isinstance(value, list):
            raise serializers.ValidationError('Includes must be a list.')
        return value

    def validate_excludes(self, value):
        """Ensure excludes is a list."""
        if value is not None and not isinstance(value, list):
            raise serializers.ValidationError('Excludes must be a list.')
        return value

    def validate_images(self, value):
        """Ensure images is a list."""
        if value is not None and not isinstance(value, list):
            raise serializers.ValidationError('Images must be a list.')
        return value


# ============================================
# FAVORITE SERIALIZERS
# ============================================

class FavoriteSerializer(serializers.ModelSerializer):
    """
    Serializer for favorite list view.
    
    Returns the favorited package with basic info.
    """
    
    package = PackageListSerializer(read_only=True)
    
    class Meta:
        model = Favorite
        fields = [
            'id',
            'package',
            'created_at',
        ]


class FavoriteCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for adding a package to favorites.
    """
    
    class Meta:
        model = Favorite
        fields = ['package']
    
    def validate_package(self, value):
        """Ensure package exists and is active."""
        if not value.is_active:
            raise serializers.ValidationError('Cannot favorite an inactive package.')
        return value
    
    def validate(self, attrs):
        """Check if already favorited."""
        user = self.context['request'].user
        package = attrs.get('package')
        
        if Favorite.objects.filter(user=user, package=package).exists():
            raise serializers.ValidationError(
                {'detail': 'Package is already in your favorites.'}
            )
        
        return attrs
    
    def create(self, validated_data):
        """Create favorite with the current user."""
        user = self.context['request'].user
        return Favorite.objects.create(user=user, **validated_data)


class FavoriteToggleSerializer(serializers.Serializer):
    """
    Serializer for toggling favorite status.
    
    Returns whether the package is now favorited or not.
    """
    
    package_id = serializers.IntegerField()
    
    def validate_package_id(self, value):
        """Ensure package exists."""
        try:
            package = Package.objects.get(pk=value, is_active=True)
        except Package.DoesNotExist:
            raise serializers.ValidationError('Package not found or inactive.')
        return value

