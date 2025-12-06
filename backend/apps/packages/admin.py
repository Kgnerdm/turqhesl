"""
Admin configuration for the packages app.
"""

from django.contrib import admin

from .models import Package


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    """Admin for Package model."""

    list_display = [
        'name',
        'provider',
        'category',
        'price',
        'currency',
        'duration',
        'is_active',
        'is_featured',
        'created_at',
    ]
    list_filter = ['category', 'is_active', 'is_featured', 'currency', 'created_at']
    search_fields = ['name', 'description', 'provider__business_name']
    ordering = ['-created_at']
    
    readonly_fields = ['created_at', 'updated_at', 'booking_count']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('provider', 'name', 'description', 'category')
        }),
        ('Pricing & Duration', {
            'fields': ('price', 'currency', 'duration')
        }),
        ('Details', {
            'fields': ('includes', 'excludes', 'images')
        }),
        ('Status', {
            'fields': ('is_active', 'is_featured', 'booking_count')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

