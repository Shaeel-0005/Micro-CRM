"""
backend/apps/leads/urls.py
Phase 1: Added nested note routes under each lead.

Routes:
  GET    /api/leads/                              list leads
  POST   /api/leads/                              create lead
  GET    /api/leads/{id}/                         lead detail (includes activities)
  PUT    /api/leads/{id}/                         update lead
  PATCH  /api/leads/{id}/                         partial update lead
  DELETE /api/leads/{id}/                         delete lead
  GET    /api/leads/stats/                        lead stats
  GET    /api/leads/recent/                       recent leads

  GET    /api/leads/{lead_id}/notes/              list notes for a lead
  POST   /api/leads/{lead_id}/notes/              add note to a lead
  DELETE /api/leads/{lead_id}/notes/{id}/         delete a specific note
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter, SimpleRouter
from .views import LeadViewSet, NoteViewSet

router = DefaultRouter()
router.register(r'', LeadViewSet, basename='lead')

note_router = SimpleRouter()
note_router.register(r'notes', NoteViewSet, basename='lead-note')

urlpatterns = [
    # All nested note routes first (more specific)
    path('<int:lead_pk>/', include(note_router.urls)),

    # All lead routes
    path('', include(router.urls)),
]