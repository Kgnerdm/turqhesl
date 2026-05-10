from django.urls import path

from .views import SmartMatchView

app_name = 'ai'

urlpatterns = [
    path('smart-match/', SmartMatchView.as_view(), name='smart-match'),
]
