"""
backend/apps/leads/urls.py
Day 8: Added nested activity routes under each lead.

Routes:
  GET    /api/leads/                              list leads
  POST   /api/leads/                              create lead
  GET    /api/leads/{id}/                         lead detail (includes activities)
  PUT    /api/leads/{id}/                         update lead
  PATCH  /api/leads/{id}/                         partial update lead
  DELETE /api/leads/{id}/                         delete lead
  GET    /api/leads/stats/                        lead stats
  GET    /api/leads/recent/                       recent leads

  GET    /api/leads/{lead_id}/activities/         list activities for a lead
  POST   /api/leads/{lead_id}/activities/         add activity to a lead
  DELETE /api/leads/{lead_id}/activities/{id}/    delete a specific activity
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeadViewSet, LeadActivityViewSet

# Main leads router
router = DefaultRouter()
router.register(r'', LeadViewSet, basename='lead')

# Nested activities router
activity_router = DefaultRouter()
activity_router.register(r'activities', LeadActivityViewSet, basename='lead-activity')

urlpatterns = [
    # All nested activity routes first (more specific)
    path('<int:lead_pk>/', include(activity_router.urls)),

    # All lead routes
    path('', include(router.urls)),
]