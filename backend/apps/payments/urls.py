from django.urls import path

from .views import (
    InitiatePaymentView,
    PaymentDetailView,
    ProcessPaymentView,
    StripeWebhookView,
)

app_name = 'payments'

urlpatterns = [
    path('initiate/', InitiatePaymentView.as_view(), name='initiate'),
    path('<str:token>/', PaymentDetailView.as_view(), name='detail'),
    path('<str:token>/process/', ProcessPaymentView.as_view(), name='process'),
    path('webhook/stripe/', StripeWebhookView.as_view(), name='webhook-stripe'),
]
