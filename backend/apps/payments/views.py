"""
Payment views.

Flow:
1. Patient creates a booking (existing endpoint).
2. Frontend calls POST /api/payments/initiate/ with booking_id.
   → backend creates a Payment(status=pending), returns checkout_url + token.
3. Frontend redirects patient to /payments/checkout/<token> (mock checkout page).
4. Patient submits card form → frontend calls POST /api/payments/<token>/process/.
5. Backend asks the configured provider to charge → records the result on Payment.
6. On success: booking status → confirmed + email dispatched (Celery).
7. On failure: payment recorded with error code; booking stays in pending.

For real providers we also expose POST /api/payments/webhook/<provider>/ for
the server-to-server callback path.
"""

from __future__ import annotations

from decimal import Decimal

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.bookings.models import Booking

from .models import Payment
from .providers import get_provider
from .serializers import (
    InitiatePaymentSerializer,
    PaymentSerializer,
    ProcessPaymentSerializer,
)


def _can_pay_for_booking(user, booking: Booking) -> bool:
    """Only the booking's patient (or an admin) may pay it."""
    return user.is_authenticated and (
        user.role == 'admin' or booking.patient_id == user.id
    )


class InitiatePaymentView(APIView):
    """POST /api/payments/initiate/  → create Payment, return checkout URL."""

    permission_classes = [IsAuthenticated]
    throttle_scope = 'payment'

    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking_id = serializer.validated_data['booking_id']

        try:
            booking = Booking.objects.select_related('package').get(pk=booking_id)
        except Booking.DoesNotExist:
            return Response(
                {'detail': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not _can_pay_for_booking(request.user, booking):
            return Response(
                {'detail': 'You cannot pay for this booking.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if booking.payment_status == 'paid':
            return Response(
                {'detail': 'Booking is already paid.'},
                status=status.HTTP_409_CONFLICT,
            )

        # Re-use a pending payment if one already exists, otherwise create.
        payment = booking.payments.filter(
            status__in=[Payment.Status.PENDING, Payment.Status.PROCESSING],
        ).first()
        if payment is None:
            payment = Payment.objects.create(
                booking=booking,
                user=request.user,
                amount=booking.total_price,
                currency=booking.currency,
                provider=Payment.Provider.MOCK,  # set per provider below
            )

        provider = get_provider()
        payment.provider = provider.name
        payment.save(update_fields=['provider', 'updated_at'])

        session = provider.create_checkout_session(
            payment_token=payment.token,
            amount=Decimal(str(payment.amount)),
            currency=payment.currency,
            return_url=f'/dashboard?payment={payment.token}&result=success',
            cancel_url=f'/dashboard?payment={payment.token}&result=cancel',
        )

        if session.session_id:
            payment.provider_session_id = session.session_id
            payment.save(update_fields=['provider_session_id', 'updated_at'])

        return Response(
            {
                'payment': PaymentSerializer(payment).data,
                'checkout_url': session.checkout_url,
            },
            status=status.HTTP_201_CREATED,
        )


def _payment_belongs_to(user, payment: Payment) -> bool:
    """Defense-in-depth: even with the token in hand, only the booking's
    patient (or an admin) can read or charge this payment."""
    if not user.is_authenticated:
        return False
    if user.role == 'admin':
        return True
    return payment.booking.patient_id == user.id


class PaymentDetailView(APIView):
    """GET /api/payments/<token>/  — used by the checkout page to display amount + status."""

    permission_classes = [IsAuthenticated]

    def get(self, request, token):
        payment = get_object_or_404(
            Payment.objects.select_related('booking__package', 'booking__provider'),
            token=token,
        )
        if not _payment_belongs_to(request.user, payment):
            return Response(
                {'detail': 'You do not have access to this payment.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        booking = payment.booking
        return Response({
            'payment': PaymentSerializer(payment).data,
            'booking': {
                'id': booking.id,
                'package_name': booking.package.name,
                'provider_name': booking.provider.business_name,
                'appointment_date': booking.appointment_date,
            },
        })


class ProcessPaymentView(APIView):
    """POST /api/payments/<token>/process/  — submit card → charge → record."""

    permission_classes = [IsAuthenticated]
    throttle_scope = 'payment'

    def post(self, request, token):
        payment = get_object_or_404(
            Payment.objects.select_related('booking'),
            token=token,
        )
        if not _payment_belongs_to(request.user, payment):
            return Response(
                {'detail': 'You do not have access to this payment.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if payment.is_terminal:
            return Response(
                {
                    'detail': 'This payment is no longer pending.',
                    'payment': PaymentSerializer(payment).data,
                },
                status=status.HTTP_409_CONFLICT,
            )

        serializer = ProcessPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Mark processing so duplicate clicks don't double-charge
        payment.status = Payment.Status.PROCESSING
        payment.save(update_fields=['status', 'updated_at'])

        provider = get_provider(payment.provider)
        result = provider.charge(
            amount=Decimal(str(payment.amount)),
            currency=payment.currency,
            card_number=data['card_number'],
            card_exp_month=data['card_exp_month'],
            card_exp_year=data['card_exp_year'],
            card_cvc=data['card_cvc'],
        )

        # Capture card snapshot regardless of success
        if result.card_last4:
            payment.card_last4 = result.card_last4
        if result.card_brand:
            payment.card_brand = result.card_brand

        if result.succeeded:
            payment.mark_succeeded(charge_id=result.charge_id)
            self._on_payment_succeeded(payment)
            from apps.notifications import services as notif_services
            notif_services.notify_payment_succeeded(payment)
        else:
            payment.mark_failed(
                status=result.status,
                code=result.error_code,
                message=result.error_message,
            )
            from apps.notifications import services as notif_services
            notif_services.notify_payment_failed(payment)

        return Response(
            {
                'payment': PaymentSerializer(payment).data,
                'succeeded': result.succeeded,
            },
            status=status.HTTP_200_OK,
        )

    @staticmethod
    def _on_payment_succeeded(payment: Payment) -> None:
        """Promote the booking + queue the confirmation email."""
        booking = payment.booking
        booking.payment_status = Booking.PaymentStatus.PAID
        if booking.status == Booking.Status.PENDING:
            booking.status = Booking.Status.CONFIRMED
            booking.confirmed_at = timezone.now()
        booking.save(update_fields=[
            'payment_status', 'status', 'confirmed_at', 'updated_at',
        ])

        # Async email — same task used by the lifecycle hook
        from apps.notifications.tasks import send_booking_confirmed_email
        send_booking_confirmed_email.delay(booking.id)


class StripeWebhookView(APIView):
    """POST /api/payments/webhook/stripe/

    Skeleton — left in place so the URL exists. When Stripe is enabled,
    StripePaymentProvider.verify_webhook() does signature verification and
    we update the Payment based on the event type.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        try:
            provider = get_provider('stripe')
            signature = request.META.get('HTTP_STRIPE_SIGNATURE', '')
            event = provider.verify_webhook(payload=request.body, signature=signature)
        except NotImplementedError:
            return Response(
                {'detail': 'Stripe webhook handler not active in this build.'},
                status=status.HTTP_501_NOT_IMPLEMENTED,
            )
        # TODO(production): switch on event['type'] and update the matching Payment
        return Response({'received': True, 'event': event.get('type', 'unknown')})
