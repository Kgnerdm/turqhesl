"""
Package models for TurqHeal.

Medical treatment packages offered by healthcare providers.
"""

from django.db import models


class PackageCategory(models.TextChoices):
    """Package category choices."""
    DENTAL = 'dental', 'Dental Care'
    HAIR_TRANSPLANT = 'hair_transplant', 'Hair Transplant'
    RHINOPLASTY = 'rhinoplasty', 'Rhinoplasty'
    FACE_LIFT = 'face_lift', 'Face Lift'
    LIPOSUCTION = 'liposuction', 'Liposuction'
    BREAST_AUGMENTATION = 'breast_augmentation', 'Breast Augmentation'
    TUMMY_TUCK = 'tummy_tuck', 'Tummy Tuck'
    BLEPHAROPLASTY = 'blepharoplasty', 'Blepharoplasty'
    EYE_SURGERY = 'eye_surgery', 'Eye Surgery'
    CARDIOLOGY = 'cardiology', 'Cardiology'
    ONCOLOGY = 'oncology', 'Oncology'
    ORTHOPEDIC = 'orthopedic', 'Orthopedic'
    BARIATRIC = 'bariatric', 'Bariatric Surgery'
    FERTILITY = 'fertility', 'Fertility Treatment'
    CHECKUP = 'checkup', 'Health Checkup'
    OTHER = 'other', 'Other'


class Package(models.Model):
    """
    Medical package model.
    
    Represents a specific treatment package offered by a provider,
    including pricing, duration, and what's included.
    """

    # Provider relationship
    provider = models.ForeignKey(
        'providers.Provider',
        on_delete=models.CASCADE,
        related_name='packages',
    )

    # Basic Information
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(
        max_length=50,
        choices=PackageCategory.choices,
        default=PackageCategory.OTHER,
    )
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    # Duration
    duration = models.CharField(max_length=50)  # e.g., "5-7 days"
    
    # What's included/excluded
    includes = models.JSONField(default=list)
    # Format: ["Consultation", "Hotel", "Transfer", ...]
    
    excludes = models.JSONField(default=list)
    # Format: ["Flights", "Personal expenses", ...]
    
    # Images
    images = models.JSONField(default=list)
    # Format: ["url1", "url2", ...]
    
    # Status
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    # Stats (denormalized for performance)
    booking_count = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'package'
        verbose_name_plural = 'packages'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.provider.business_name}"

    @property
    def category_display(self):
        """Return the display name for the category."""
        return self.get_category_display()

    @property
    def price_formatted(self):
        """Return formatted price with currency."""
        return f"${self.price:,.0f}" if self.currency == 'USD' else f"{self.price:,.0f} {self.currency}"

