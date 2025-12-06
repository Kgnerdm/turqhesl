"""
Views for the providers app.
"""

from django.db.models import Count
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsAdminUser, IsProvider
from .models import Provider
from .serializers import (
    ProviderCreateSerializer,
    ProviderDetailSerializer,
    ProviderListSerializer,
    ProviderUpdateSerializer,
    ProviderVerifySerializer,
)


class ProviderListView(APIView):
    """
    API endpoint for listing providers.
    
    GET /api/providers/
    
    Query Parameters:
        - city: Filter by city
        - category: Filter by category
        - is_verified: Filter by verification status (true/false)
        - search: Search in business name
        - page: Page number (default: 1)
        - limit: Items per page (default: 10)
    """

    permission_classes = [AllowAny]

    def get(self, request):
        """List all active providers with optional filters."""
        queryset = Provider.objects.filter(is_active=True)
        
        # Apply filters
        city = request.query_params.get('city')
        if city:
            queryset = queryset.filter(city__iexact=city)
        
        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(categories__contains=category)
        
        is_verified = request.query_params.get('is_verified')
        if is_verified is not None:
            is_verified_bool = is_verified.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_verified=is_verified_bool)
        
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(business_name__icontains=search)
        
        # Annotate with package count (using different name to avoid conflict with property)
        queryset = queryset.annotate(
            active_package_count=Count('packages', filter=models.Q(packages__is_active=True))
        )
        
        # Ordering
        sort_by = request.query_params.get('sort_by', 'newest')
        if sort_by == 'name':
            queryset = queryset.order_by('business_name')
        elif sort_by == 'name_desc':
            queryset = queryset.order_by('-business_name')
        else:  # newest (default)
            queryset = queryset.order_by('-created_at')
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 10))
        offset = (page - 1) * limit
        
        total = queryset.count()
        providers = queryset[offset:offset + limit]
        
        serializer = ProviderListSerializer(providers, many=True)
        
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


class ProviderDetailView(APIView):
    """
    API endpoint for provider detail.
    
    GET /api/providers/:id/
    """

    permission_classes = [AllowAny]

    def get(self, request, pk):
        """Get provider details by ID."""
        try:
            provider = Provider.objects.annotate(
                active_package_count=Count('packages', filter=models.Q(packages__is_active=True))
            ).get(pk=pk, is_active=True)
        except Provider.DoesNotExist:
            return Response(
                {'detail': 'Provider not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ProviderDetailSerializer(provider)
        return Response(serializer.data)


class ProviderCreateView(APIView):
    """
    API endpoint for creating a provider profile.
    
    POST /api/providers/
    
    Only users with 'provider' role can create a provider profile.
    """

    permission_classes = [IsAuthenticated, IsProvider]

    def post(self, request):
        """Create a new provider profile for the current user."""
        serializer = ProviderCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        provider = serializer.save()
        
        # Return the created provider with full details
        detail_serializer = ProviderDetailSerializer(provider)
        return Response(
            detail_serializer.data,
            status=status.HTTP_201_CREATED
        )


class ProviderUpdateView(APIView):
    """
    API endpoint for updating provider profile.
    
    PATCH /api/providers/:id/
    
    Only the provider owner can update their profile.
    """

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        """Update provider profile."""
        try:
            provider = Provider.objects.get(pk=pk)
        except Provider.DoesNotExist:
            return Response(
                {'detail': 'Provider not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check ownership (or admin)
        if provider.user != request.user and request.user.role != 'admin':
            return Response(
                {'detail': 'You do not have permission to update this provider.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ProviderUpdateSerializer(
            provider,
            data=request.data,
            partial=True
        )
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        
        # Return updated provider
        detail_serializer = ProviderDetailSerializer(provider)
        return Response(detail_serializer.data)


class ProviderVerifyView(APIView):
    """
    API endpoint for verifying a provider (admin only).
    
    POST /api/providers/:id/verify/
    """

    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        """Verify or unverify a provider."""
        try:
            provider = Provider.objects.get(pk=pk)
        except Provider.DoesNotExist:
            return Response(
                {'detail': 'Provider not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ProviderVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        is_verified = serializer.validated_data['is_verified']
        provider.is_verified = is_verified
        
        if is_verified:
            provider.verification_date = timezone.now()
            provider.verified_by = request.user
        else:
            provider.verification_date = None
            provider.verified_by = None
        
        provider.save()
        
        detail_serializer = ProviderDetailSerializer(provider)
        return Response(detail_serializer.data)


class MyProviderView(APIView):
    """
    API endpoint for current user's provider profile.
    
    GET /api/providers/me/
    """

    permission_classes = [IsAuthenticated, IsProvider]

    def get(self, request):
        """Get current user's provider profile."""
        try:
            provider = Provider.objects.annotate(
                active_package_count=Count('packages', filter=models.Q(packages__is_active=True))
            ).get(user=request.user)
        except Provider.DoesNotExist:
            return Response(
                {'detail': 'Provider profile not found. Please create one first.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ProviderDetailSerializer(provider)
        return Response(serializer.data)


# Import models for Q filter
from django.db import models

