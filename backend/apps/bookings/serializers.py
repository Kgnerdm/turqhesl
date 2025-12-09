from rest_framework import serializers
from django.utils import timezone
from .models import Booking
from apps.packages.serializers import PackageListSerializer
from apps.providers.serializers import ProviderListSerializer
from apps.users.serializers import UserSerializer


class BookingListSerializer(serializers.ModelSerializer):
    """Serializer for listing bookings with summary information."""
    
    package_name = serializers.CharField(source='package.name', read_only=True)
    package_category = serializers.CharField(source='package.category', read_only=True)
    provider_name = serializers.CharField(source='provider.business_name', read_only=True)
    provider_city = serializers.CharField(source='provider.city', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id',
            'patient_name',
            'patient_email',
            'patient_phone',
            'package_name',
            'package_category',
            'provider_name',
            'provider_city',
            'status',
            'status_display',
            'appointment_date',
            'appointment_time',
            'total_price',
            'currency',
            'payment_status',
            'payment_status_display',
            'notes',
            'created_at',
        ]


class BookingDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single booking view."""
    
    patient = UserSerializer(read_only=True)
    provider = ProviderListSerializer(read_only=True)
    package = PackageListSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    is_cancellable = serializers.BooleanField(read_only=True)
    is_confirmable = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id',
            'patient',
            'provider',
            'package',
            'status',
            'status_display',
            'booking_date',
            'appointment_date',
            'appointment_time',
            'patient_name',
            'patient_email',
            'patient_phone',
            'notes',
            'provider_notes',
            'total_price',
            'currency',
            'payment_status',
            'payment_status_display',
            'confirmed_at',
            'completed_at',
            'cancelled_at',
            'cancellation_reason',
            'is_cancellable',
            'is_confirmable',
            'created_at',
            'updated_at',
        ]


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new booking."""
    
    package_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'package_id',
            'appointment_date',
            'appointment_time',
            'patient_name',
            'patient_email',
            'patient_phone',
            'notes',
        ]
    
    def validate_package_id(self, value):
        """Validate that the package exists and is active."""
        from apps.packages.models import Package
        try:
            package = Package.objects.select_related('provider').get(id=value, is_active=True)
            self.context['package'] = package
            return value
        except Package.DoesNotExist:
            raise serializers.ValidationError("Package not found or is not available.")
    
    def validate_appointment_date(self, value):
        """Validate that the appointment date is in the future."""
        if value < timezone.now().date():
            raise serializers.ValidationError("Appointment date must be in the future.")
        return value
    
    def create(self, validated_data):
        """Create a new booking with the package and provider information."""
        package = self.context['package']
        user = self.context['request'].user
        
        # Remove package_id as we'll use the package object
        validated_data.pop('package_id')
        
        booking = Booking.objects.create(
            patient=user,
            provider=package.provider,
            package=package,
            total_price=package.price,
            currency=package.currency,
            **validated_data
        )
        
        return booking


class BookingStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating booking status."""
    
    status = serializers.ChoiceField(choices=Booking.Status.choices)
    notes = serializers.CharField(required=False, allow_blank=True)
    cancellation_reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate_status(self, value):
        """Validate status transition."""
        booking = self.context.get('booking')
        if not booking:
            return value
        
        current_status = booking.status
        
        # Define valid transitions
        valid_transitions = {
            Booking.Status.PENDING: [
                Booking.Status.CONFIRMED,
                Booking.Status.CANCELLED,
            ],
            Booking.Status.CONFIRMED: [
                Booking.Status.IN_PROGRESS,
                Booking.Status.CANCELLED,
            ],
            Booking.Status.IN_PROGRESS: [
                Booking.Status.COMPLETED,
                Booking.Status.CANCELLED,
            ],
            Booking.Status.COMPLETED: [
                Booking.Status.REFUNDED,
            ],
            Booking.Status.CANCELLED: [],
            Booking.Status.REFUNDED: [],
        }
        
        if value not in valid_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f"Cannot transition from '{current_status}' to '{value}'."
            )
        
        return value
    
    def update(self, instance, validated_data):
        """Update booking status with timestamps."""
        new_status = validated_data.get('status')
        notes = validated_data.get('notes', '')
        cancellation_reason = validated_data.get('cancellation_reason', '')
        
        instance.status = new_status
        
        # Update provider notes if provided
        if notes:
            instance.provider_notes = notes
        
        # Set timestamps based on status
        now = timezone.now()
        
        if new_status == Booking.Status.CONFIRMED:
            instance.confirmed_at = now
        elif new_status == Booking.Status.COMPLETED:
            instance.completed_at = now
        elif new_status == Booking.Status.CANCELLED:
            instance.cancelled_at = now
            if cancellation_reason:
                instance.cancellation_reason = cancellation_reason
        elif new_status == Booking.Status.REFUNDED:
            instance.payment_status = Booking.PaymentStatus.REFUNDED
        
        instance.save()
        return instance


class BookingCancelSerializer(serializers.Serializer):
    """Serializer for cancelling a booking (patient side)."""
    
    reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        """Validate that the booking can be cancelled."""
        booking = self.context.get('booking')
        if not booking:
            raise serializers.ValidationError("Booking not found.")
        
        if not booking.is_cancellable:
            raise serializers.ValidationError(
                "This booking cannot be cancelled. Only pending or confirmed bookings can be cancelled."
            )
        
        return data
    
    def update(self, instance, validated_data):
        """Cancel the booking."""
        instance.status = Booking.Status.CANCELLED
        instance.cancelled_at = timezone.now()
        instance.cancellation_reason = validated_data.get('reason', 'Cancelled by patient')
        instance.save()
        return instance

