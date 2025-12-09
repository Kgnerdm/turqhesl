from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'patient_name',
        'provider',
        'package',
        'status',
        'appointment_date',
        'total_price',
        'payment_status',
        'created_at',
    ]
    list_filter = [
        'status',
        'payment_status',
        'appointment_date',
        'provider__city',
    ]
    search_fields = [
        'patient_name',
        'patient_email',
        'patient_phone',
        'provider__business_name',
        'package__name',
    ]
    readonly_fields = [
        'booking_date',
        'confirmed_at',
        'completed_at',
        'cancelled_at',
        'created_at',
        'updated_at',
    ]
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Booking Information', {
            'fields': (
                'patient',
                'provider',
                'package',
                'status',
                'booking_date',
            )
        }),
        ('Appointment Details', {
            'fields': (
                'appointment_date',
                'appointment_time',
            )
        }),
        ('Patient Information', {
            'fields': (
                'patient_name',
                'patient_email',
                'patient_phone',
                'notes',
            )
        }),
        ('Payment', {
            'fields': (
                'total_price',
                'currency',
                'payment_status',
            )
        }),
        ('Provider Notes', {
            'fields': (
                'provider_notes',
            )
        }),
        ('Status Timestamps', {
            'fields': (
                'confirmed_at',
                'completed_at',
                'cancelled_at',
                'cancellation_reason',
            ),
            'classes': ('collapse',),
        }),
        ('Metadata', {
            'fields': (
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',),
        }),
    )

