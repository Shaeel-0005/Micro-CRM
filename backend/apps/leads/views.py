"""
backend/apps/leads/views.py
Day 8: Added LeadActivityViewSet for nested activity endpoints
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Lead, LeadActivity
from .serializers import (
    LeadListSerializer,
    LeadDetailSerializer,
    LeadCreateSerializer,
    LeadActivitySerializer,
)


# ─── Lead ViewSet ─────────────────────────────────────────────────────────────

class LeadViewSet(viewsets.ModelViewSet):
    """
    Complete CRUD operations for leads.

    list:           GET  /api/leads/
    create:         POST /api/leads/
    retrieve:       GET  /api/leads/{id}/
    update:         PUT  /api/leads/{id}/
    partial_update: PATCH /api/leads/{id}/
    destroy:        DELETE /api/leads/{id}/
    stats:          GET  /api/leads/stats/
    recent:         GET  /api/leads/recent/
    """
    permission_classes = [IsAuthenticated]
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['name', 'email', 'company']
    ordering_fields    = ['created_at', 'name', 'company', 'status']
    ordering           = ['-created_at']

    def get_queryset(self):
        """Filter leads to only show the authenticated user's own leads."""
        queryset = Lead.objects.filter(owner=self.request.user)

        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        source_filter = self.request.query_params.get('source')
        if source_filter:
            queryset = queryset.filter(source=source_filter)

        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return LeadListSerializer
        elif self.action == 'create':
            return LeadCreateSerializer
        return LeadDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        detail_serializer = LeadDetailSerializer(
            serializer.instance,
            context={'request': request}
        )
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """GET /api/leads/stats/ — counts by status and source."""
        queryset = self.get_queryset()
        data = {
            'total': queryset.count(),
            'by_status': {
                'new':         queryset.filter(status='new').count(),
                'contacted':   queryset.filter(status='contacted').count(),
                'in_progress': queryset.filter(status='in_progress').count(),
                'won':         queryset.filter(status='won').count(),
                'lost':        queryset.filter(status='lost').count(),
            },
            'by_source': {},
        }
        for source in queryset.values_list('source', flat=True).distinct():
            data['by_source'][source] = queryset.filter(source=source).count()

        return Response(data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """GET /api/leads/recent/ — last 10 leads."""
        queryset   = self.get_queryset()[:10]
        serializer = LeadListSerializer(queryset, many=True)
        return Response(serializer.data)


# ─── Lead Activity ViewSet ────────────────────────────────────────────────────

class LeadActivityViewSet(viewsets.ModelViewSet):
    """
    CRUD for activities nested under a lead.

    list:    GET    /api/leads/{lead_id}/activities/
    create:  POST   /api/leads/{lead_id}/activities/
    destroy: DELETE /api/leads/{lead_id}/activities/{id}/

    Update is intentionally excluded — activities are immutable once logged.
    """
    permission_classes = [IsAuthenticated]
    serializer_class   = LeadActivitySerializer
    http_method_names  = ['get', 'post', 'delete', 'head', 'options']

    def _get_lead(self):
        """
        Fetch the parent lead — must belong to the authenticated user.
        Returns 404 if the lead doesn't exist or belongs to another user.
        """
        return get_object_or_404(
            Lead,
            pk=self.kwargs['lead_pk'],
            owner=self.request.user
        )

    def get_queryset(self):
        lead = self._get_lead()
        return LeadActivity.objects.filter(lead=lead)

    def perform_create(self, serializer):
        lead = self._get_lead()
        serializer.save(lead=lead)