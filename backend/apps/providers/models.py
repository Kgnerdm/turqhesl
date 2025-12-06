"""
Provider models for TurqHeal.

Healthcare providers (clinics, hospitals) that offer medical packages.
"""

from django.conf import settings
from django.db import models


class ProviderCategory(models.TextChoices):
    """Provider category choices."""
    DENTAL = 'dental', 'Dental Care'
    HAIR_TRANSPLANT = 'hair_transplant', 'Hair Transplant'
    COSMETIC = 'cosmetic', 'Cosmetic Surgery'
    EYE = 'eye', 'Eye Surgery'
    ORTHOPEDIC = 'orthopedic', 'Orthopedic'
    CARDIOLOGY = 'cardiology', 'Cardiology'
    ONCOLOGY = 'oncology', 'Oncology'
    FERTILITY = 'fertility', 'Fertility'
    GENERAL = 'general', 'General Healthcare'
    OTHER = 'other', 'Other'


class Provider(models.Model):
    """
    Healthcare provider model.
    
    Represents clinics, hospitals, or medical centers that offer
    health tourism packages.
    """

    # Owner (user with provider role)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='provider_profile',
    )

    # Basic Information
    business_name = models.CharField(max_length=255)
    description = models.TextField()
    
    # Location
    city = models.CharField(max_length=100)
    address = models.TextField()
    
    # Contact
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    website = models.URLField(blank=True, null=True)
    
    # Images
    logo_url = models.URLField(blank=True, null=True)
    cover_image_url = models.URLField(blank=True, null=True)
    
    # Categories (stored as comma-separated values for simplicity)
    categories = models.JSONField(default=list)
    
    # Verification
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(blank=True, null=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='verified_providers',
    )
    
    # Certificates (stored as JSON for flexibility)
    certificates = models.JSONField(default=list)
    # Format: [{"name": "JCI", "issued_by": "...", "issued_date": "..."}]
    
    # Working Hours (stored as JSON)
    working_hours = models.JSONField(default=dict)
    # Format: {"monday": {"is_open": true, "open_time": "09:00", "close_time": "18:00"}, ...}
    
    # Additional images (gallery)
    images = models.JSONField(default=list)
    # Format: ["url1", "url2", ...]
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'provider'
        verbose_name_plural = 'providers'
        ordering = ['-created_at']

    def __str__(self):
        return self.business_name

    @property
    def package_count(self):
        """Return the number of active packages for this provider."""
        return self.packages.filter(is_active=True).count()

    @property
    def category_list(self):
        """Return categories as a list."""
        if isinstance(self.categories, list):
            return self.categories
        return []

