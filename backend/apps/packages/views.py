"""
Views for the packages app.
"""

from decimal import Decimal

from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsProvider
from .models import Package
from .serializers import (
    PackageCreateSerializer,
    PackageDetailSerializer,
    PackageListSerializer,
    PackageUpdateSerializer,
)


class PackageListView(APIView):
    """
    API endpoint for listing packages.
    
    GET /api/packages/
    
    Query Parameters:
        - category: Filter by category
        - city: Filter by provider city
        - provider: Filter by provider ID
        - min_price: Minimum price
        - max_price: Maximum price
        - search: Search in name and description
        - sort_by: price_asc, price_desc, newest, popular
        - page: Page number (default: 1)
        - limit: Items per page (default: 10)
    """

    permission_classes = [AllowAny]

    def get(self, request):
        """List all active packages with optional filters."""
        queryset = Package.objects.filter(
            is_active=True,
            provider__is_active=True
        ).select_related('provider')
        
        # Apply filters
        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        city = request.query_params.get('city')
        if city:
            queryset = queryset.filter(provider__city__iexact=city)
        
        provider_id = request.query_params.get('provider')
        if provider_id:
            queryset = queryset.filter(provider_id=provider_id)
        
        min_price = request.query_params.get('min_price')
        if min_price:
            queryset = queryset.filter(price__gte=Decimal(min_price))
        
        max_price = request.query_params.get('max_price')
        if max_price:
            queryset = queryset.filter(price__lte=Decimal(max_price))
        
        is_verified = request.query_params.get('is_verified')
        if is_verified is not None:
            is_verified_bool = is_verified.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(provider__is_verified=is_verified_bool)
        
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        # Ordering
        sort_by = request.query_params.get('sort_by', 'newest')
        if sort_by == 'price_asc':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_desc':
            queryset = queryset.order_by('-price')
        elif sort_by == 'popular':
            queryset = queryset.order_by('-booking_count')
        else:  # newest (default)
            queryset = queryset.order_by('-created_at')
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 10))
        offset = (page - 1) * limit
        
        total = queryset.count()
        packages = queryset[offset:offset + limit]
        
        serializer = PackageListSerializer(packages, many=True)
        
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


class PackageDetailView(APIView):
    """
    API endpoint for package detail.
    
    GET /api/packages/:id/
    """

    permission_classes = [AllowAny]

    def get(self, request, pk):
        """Get package details by ID."""
        try:
            package = Package.objects.select_related('provider').get(
                pk=pk,
                is_active=True,
                provider__is_active=True
            )
        except Package.DoesNotExist:
            return Response(
                {'detail': 'Package not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = PackageDetailSerializer(package)
        return Response(serializer.data)


class PackageCreateView(APIView):
    """
    API endpoint for creating a package.
    
    POST /api/packages/
    
    Only providers can create packages.
    """

    permission_classes = [IsAuthenticated, IsProvider]

    def post(self, request):
        """Create a new package."""
        serializer = PackageCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        package = serializer.save()
        
        detail_serializer = PackageDetailSerializer(package)
        return Response(
            detail_serializer.data,
            status=status.HTTP_201_CREATED
        )


class PackageUpdateView(APIView):
    """
    API endpoint for updating a package.
    
    PATCH /api/packages/:id/
    
    Only the package owner can update.
    """

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        """Update a package."""
        try:
            package = Package.objects.select_related('provider').get(pk=pk)
        except Package.DoesNotExist:
            return Response(
                {'detail': 'Package not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check ownership (or admin)
        if package.provider.user != request.user and request.user.role != 'admin':
            return Response(
                {'detail': 'You do not have permission to update this package.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = PackageUpdateSerializer(
            package,
            data=request.data,
            partial=True
        )
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        
        detail_serializer = PackageDetailSerializer(package)
        return Response(detail_serializer.data)


class PackageDeleteView(APIView):
    """
    API endpoint for deleting a package.
    
    DELETE /api/packages/:id/
    
    Soft delete (sets is_active=False).
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        """Delete (deactivate) a package."""
        try:
            package = Package.objects.select_related('provider').get(pk=pk)
        except Package.DoesNotExist:
            return Response(
                {'detail': 'Package not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check ownership (or admin)
        if package.provider.user != request.user and request.user.role != 'admin':
            return Response(
                {'detail': 'You do not have permission to delete this package.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Soft delete
        package.is_active = False
        package.save()
        
        return Response(
            {'detail': 'Package deleted successfully.'},
            status=status.HTTP_200_OK
        )


class MyPackagesView(APIView):
    """
    API endpoint for current provider's packages.
    
    GET /api/packages/my/
    """

    permission_classes = [IsAuthenticated, IsProvider]

    def get(self, request):
        """Get current provider's packages."""
        if not hasattr(request.user, 'provider_profile'):
            return Response(
                {'detail': 'Provider profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        packages = Package.objects.filter(
            provider=request.user.provider_profile
        ).order_by('-created_at')
        
        # Include inactive packages for the owner
        include_inactive = request.query_params.get('include_inactive', 'true')
        if include_inactive.lower() not in ('true', '1', 'yes'):
            packages = packages.filter(is_active=True)
        
        serializer = PackageListSerializer(packages, many=True)
        return Response({'data': serializer.data})


class PackageToggleStatusView(APIView):
    """
    API endpoint for toggling package active status.
    
    PATCH /api/packages/:id/toggle-status/
    
    Only the package owner can toggle status.
    """

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        """Toggle package is_active status."""
        try:
            package = Package.objects.select_related('provider').get(pk=pk)
        except Package.DoesNotExist:
            return Response(
                {'detail': 'Package not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check ownership (or admin)
        if package.provider.user != request.user and request.user.role != 'admin':
            return Response(
                {'detail': 'You do not have permission to update this package.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Toggle status
        package.is_active = not package.is_active
        package.save()
        
        serializer = PackageDetailSerializer(package)
        return Response(serializer.data)


class ProviderPackagesView(APIView):
    """
    API endpoint for a specific provider's packages.
    
    GET /api/providers/:id/packages/
    """

    permission_classes = [AllowAny]

    def get(self, request, provider_id):
        """Get packages for a specific provider."""
        packages = Package.objects.filter(
            provider_id=provider_id,
            is_active=True,
            provider__is_active=True
        ).order_by('-created_at')
        
        serializer = PackageListSerializer(packages, many=True)
        return Response({'data': serializer.data})

