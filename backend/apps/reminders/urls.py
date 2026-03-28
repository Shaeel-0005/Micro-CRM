"""
apps/reminders/urls.py
Day 9: Reminder routes.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReminderViewSet

router = DefaultRouter()
router.register(r'', ReminderViewSet, basename='reminder')

urlpatterns = [
    path('', include(router.urls)),
]

# Generated URL names:
#   reminder-list       GET/POST  /api/reminders/
#   reminder-detail     GET/PUT/PATCH/DELETE  /api/reminders/{id}/
#   reminder-complete   POST  /api/reminders/{id}/complete/
#   reminder-upcoming   GET   /api/reminders/upcoming/
#   reminder-overdue    GET   /api/reminders/overdue/
#   reminder-stats      GET   /api/reminders/stats/