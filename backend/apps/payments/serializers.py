"""Serializers for the payments app."""

from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    """Public read-only view of a payment, safe to return to the frontend."""

    class Meta:
        model = Payment
        fields = [
            'id',
            'token',
            'booking',
            'amount',
            'currency',
            'status',
            'provider',
            'card_last4',
            'card_brand',
            'error_code',
            'error_message',
            'created_at',
            'updated_at',
            'succeeded_at',
        ]
        read_only_fields = fields


class InitiatePaymentSerializer(serializers.Serializer):
    """Body for POST /api/payments/initiate/"""
    booking_id = serializers.IntegerField()


class ProcessPaymentSerializer(serializers.Serializer):
    """Body for POST /api/payments/<token>/process/

    Card data only ever lives in memory for the duration of the charge call —
    we never persist anything beyond `last4` + `brand`.
    """
    card_number = serializers.CharField(max_length=32)
    card_exp_month = serializers.CharField(max_length=2)
    card_exp_year = serializers.CharField(max_length=4)
    card_cvc = serializers.CharField(max_length=4)
    cardholder_name = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
    )
