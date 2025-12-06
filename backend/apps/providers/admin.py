"""
Admin configuration for the providers app.
"""

from django.contrib import admin

from .models import Provider


@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    """Admin for Provider model."""

    list_display = [
        'business_name',
        'city',
        'is_verified',
        'is_active',
        'user',
        'created_at',
    ]
    list_filter = ['is_verified', 'is_active', 'city', 'created_at']
    search_fields = ['business_name', 'email', 'user__email']
    ordering = ['-created_at']
    
    readonly_fields = ['created_at', 'updated_at', 'verification_date', 'verified_by']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'business_name', 'description')
        }),
        ('Location', {
            'fields': ('city', 'address')
        }),
        ('Contact', {
            'fields': ('phone', 'email', 'website')
        }),
        ('Images', {
            'fields': ('logo_url', 'cover_image_url', 'images')
        }),
        ('Categories & Certificates', {
            'fields': ('categories', 'certificates', 'working_hours')
        }),
        ('Verification', {
            'fields': ('is_verified', 'verification_date', 'verified_by')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

