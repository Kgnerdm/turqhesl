"""
Custom permissions for the users app.

Provides role-based access control for TurqHeal.
"""

from rest_framework import permissions

from .models import UserRole


class IsPatient(permissions.BasePermission):
    """
    Permission class that allows access only to patients.
    """

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == UserRole.PATIENT
        )


class IsProvider(permissions.BasePermission):
    """
    Permission class that allows access only to providers.
    """

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == UserRole.PROVIDER
        )


class IsAdminUser(permissions.BasePermission):
    """
    Permission class that allows access only to admin users.
    """

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == UserRole.ADMIN
        )


class IsPatientOrProvider(permissions.BasePermission):
    """
    Permission class that allows access to patients or providers.
    """

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in [UserRole.PATIENT, UserRole.PROVIDER]
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission class that allows access to the owner of an object or admin users.
    
    Assumes the object has a 'user' attribute or is a User instance.
    """

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin has access to everything
        if request.user.role == UserRole.ADMIN:
            return True
        
        # Check if user is the owner
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # If the object is a User instance
        return obj == request.user

