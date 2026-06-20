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
from rest_framework.routers import SimpleRouter
from .views import (
    LeadViewSet,
    LeadTagViewSet,
    NoteViewSet,
    ProposalViewSet,
    SavedViewViewSet,
)

router = SimpleRouter()
router.register(r'', LeadViewSet, basename='lead')

note_router = SimpleRouter()
note_router.register(r'notes', NoteViewSet, basename='lead-note')

meta_router = SimpleRouter()
meta_router.register(r'tags', LeadTagViewSet, basename='lead-tag')
meta_router.register(r'saved-views', SavedViewViewSet, basename='saved-view')
meta_router.register(r'proposals', ProposalViewSet, basename='proposal')

urlpatterns = [
    path('<int:lead_pk>/', include(note_router.urls)),
    path('', include(meta_router.urls)),
    path('', include(router.urls)),
]