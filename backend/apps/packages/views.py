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
from apps.providers.models import Provider
from .models import Package, Favorite
from .serializers import (
    PackageCreateSerializer,
    PackageDetailSerializer,
    PackageListSerializer,
    PackageUpdateSerializer,
    FavoriteSerializer,
    FavoriteCreateSerializer,
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
    
    Query Parameters:
        - include_inactive: Include deleted/inactive packages (default: false)
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
        
        # By default, only show active packages (not deleted)
        # Pass include_inactive=true to see deleted packages
        include_inactive = request.query_params.get('include_inactive', 'false')
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


# ============================================
# FAVORITE VIEWS
# ============================================

class FavoriteListView(APIView):
    """
    API endpoint for listing user's favorite packages.
    
    GET /api/packages/favorites/
    
    Returns all packages the user has favorited.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get current user's favorited packages."""
        favorites = Favorite.objects.filter(
            user=request.user
        ).select_related(
            'package',
            'package__provider'
        ).order_by('-created_at')
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 20))
        offset = (page - 1) * limit
        
        total = favorites.count()
        favorites_page = favorites[offset:offset + limit]
        
        serializer = FavoriteSerializer(favorites_page, many=True)
        
        return Response({
            'data': serializer.data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'total_pages': (total + limit - 1) // limit if total > 0 else 0,
                'has_next': offset + limit < total,
                'has_prev': page > 1,
            }
        })


class FavoriteToggleView(APIView):
    """
    API endpoint for favorite status.
    
    GET /api/packages/:id/favorite/
    - Check if package is favorited
    
    POST /api/packages/:id/favorite/
    - Toggle favorite status (add/remove)
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """Check if package is favorited by current user."""
        is_favorited = Favorite.objects.filter(
            user=request.user,
            package_id=pk
        ).exists()
        
        return Response({
            'is_favorited': is_favorited
        })

    def post(self, request, pk):
        """Toggle favorite status for a package."""
        try:
            package = Package.objects.get(pk=pk, is_active=True)
        except Package.DoesNotExist:
            return Response(
                {'detail': 'Package not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already favorited
        favorite = Favorite.objects.filter(
            user=request.user,
            package=package
        ).first()
        
        if favorite:
            # Remove from favorites
            favorite.delete()
            return Response({
                'is_favorited': False,
                'message': 'Package removed from favorites.'
            })
        else:
            # Add to favorites
            Favorite.objects.create(user=request.user, package=package)
            return Response({
                'is_favorited': True,
                'message': 'Package added to favorites.'
            }, status=status.HTTP_201_CREATED)


class FavoriteCheckView(APIView):
    """
    API endpoint for checking if a package is favorited.
    
    GET /api/packages/:id/favorite/
    
    Returns whether the package is in user's favorites.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """Check if package is favorited by current user."""
        is_favorited = Favorite.objects.filter(
            user=request.user,
            package_id=pk
        ).exists()
        
        return Response({
            'is_favorited': is_favorited
        })


class FavoriteIdsView(APIView):
    """
    API endpoint for getting all favorited package IDs.
    
    GET /api/packages/favorites/ids/
    
    Returns a list of package IDs that the user has favorited.
    Useful for checking multiple packages at once.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get list of favorited package IDs."""
        favorite_ids = list(
            Favorite.objects.filter(user=request.user)
            .values_list('package_id', flat=True)
        )
        
        return Response({
            'favorite_ids': favorite_ids,
            'count': len(favorite_ids)
        })


# ============================================
# SEARCH VIEWS
# ============================================

class SearchSuggestionsView(APIView):
    """
    API endpoint for search autocomplete suggestions.
    
    GET /api/packages/search/suggestions/?q=query
    
    Returns matching packages and providers for the search query.
    Used for autocomplete dropdown.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        """Get search suggestions for autocomplete."""
        query = request.query_params.get('q', '').strip()
        
        if len(query) < 2:
            return Response({
                'packages': [],
                'providers': [],
                'query': query
            })
        
        # Search packages
        packages = Package.objects.filter(
            Q(name__icontains=query) | Q(description__icontains=query),
            is_active=True,
            provider__is_active=True
        ).select_related('provider')[:5]
        
        package_results = [
            {
                'id': pkg.id,
                'name': pkg.name,
                'category': pkg.category,
                'category_display': pkg.get_category_display(),
                'price': str(pkg.price),
                'currency': pkg.currency,
                'provider_name': pkg.provider.business_name,
                'provider_city': pkg.provider.city,
                'provider_is_verified': pkg.provider.is_verified,
                'image': pkg.images[0] if pkg.images else None,
                'type': 'package'
            }
            for pkg in packages
        ]
        
        # Search providers
        providers = Provider.objects.filter(
            Q(business_name__icontains=query) | Q(description__icontains=query),
            is_active=True
        )[:5]
        
        provider_results = [
            {
                'id': prov.id,
                'name': prov.business_name,
                'city': prov.city,
                'categories': prov.categories,
                'is_verified': prov.is_verified,
                'package_count': prov.package_count,
                'logo_url': prov.logo_url,
                'type': 'provider'
            }
            for prov in providers
        ]
        
        return Response({
            'packages': package_results,
            'providers': provider_results,
            'query': query,
            'total': len(package_results) + len(provider_results)
        })

