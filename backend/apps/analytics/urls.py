"""
apps/analytics/urls.py
Day 12: Analytics routes.
Add to main urls.py: path('api/analytics/', include('apps.analytics.urls'))
"""

from django.urls import path
from .views import AnalyticsDashboardView

urlpatterns = [
    path('dashboard/', AnalyticsDashboardView.as_view(), name='analytics-dashboard'),
]