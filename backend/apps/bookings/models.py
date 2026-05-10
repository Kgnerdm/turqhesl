from django.db import models
from django.conf import settings
from apps.providers.models import Provider
from apps.packages.models import Package


class Booking(models.Model):
    """
    Booking model for health tourism reservations.
    Tracks the entire booking lifecycle from creation to completion.
    """
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
        REFUNDED = 'refunded', 'Refunded'
    
    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PAID = 'paid', 'Paid'
        REFUNDED = 'refunded', 'Refunded'
        FAILED = 'failed', 'Failed'
    
    # Relationships
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings',
        help_text='The patient who made the booking'
    )
    provider = models.ForeignKey(
        Provider,
        on_delete=models.CASCADE,
        related_name='bookings',
        help_text='The healthcare provider'
    )
    package = models.ForeignKey(
        Package,
        on_delete=models.CASCADE,
        related_name='bookings',
        help_text='The medical package booked'
    )
    
    # Booking Details
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        help_text='Current status of the booking'
    )
    booking_date = models.DateTimeField(
        auto_now_add=True,
        help_text='When the booking was created'
    )
    appointment_date = models.DateField(
        help_text='Scheduled appointment date'
    )
    appointment_time = models.TimeField(
        null=True,
        blank=True,
        help_text='Scheduled appointment time (optional)'
    )
    
    # Patient Information (snapshot at booking time)
    patient_name = models.CharField(
        max_length=200,
        help_text='Patient full name at booking time'
    )
    patient_email = models.EmailField(
        help_text='Patient email at booking time'
    )
    patient_phone = models.CharField(
        max_length=20,
        help_text='Patient phone number'
    )
    
    # Additional Details
    notes = models.TextField(
        blank=True,
        help_text='Additional notes or special requests from patient'
    )
    provider_notes = models.TextField(
        blank=True,
        help_text='Internal notes from provider'
    )
    
    # Pricing (snapshot at booking time)
    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Total price at booking time'
    )
    currency = models.CharField(
        max_length=3,
        default='USD',
        help_text='Currency code'
    )
    
    # Payment
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        help_text='Payment status'
    )
    
    # Timestamps
    confirmed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When the booking was confirmed'
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When the booking was completed'
    )
    cancelled_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When the booking was cancelled'
    )
    cancellation_reason = models.TextField(
        blank=True,
        help_text='Reason for cancellation'
    )

    # Private medical documents stored on Cloudinary as 'authenticated' resources.
    # Each item: {"public_id": str, "filename": str, "uploaded_at": iso, "uploaded_by": int}
    documents = models.JSONField(
        default=list,
        blank=True,
        help_text='Private medical documents (Cloudinary public_ids; signed URL on read)'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', 'status']),
            models.Index(fields=['provider', 'status']),
            models.Index(fields=['appointment_date']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Booking #{self.id} - {self.patient_name} - {self.package.name}"
    
    @property
    def is_cancellable(self):
        """Check if booking can be cancelled."""
        return self.status in [self.Status.PENDING, self.Status.CONFIRMED]
    
    @property
    def is_confirmable(self):
        """Check if booking can be confirmed."""
        return self.status == self.Status.PENDING

