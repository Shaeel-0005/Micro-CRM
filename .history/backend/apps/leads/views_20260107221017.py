"""
backend/apps/leads/views.py
Day 4: Complete CRUD API endpoints using ViewSets
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Lead
from .serializers import (
    LeadListSerializer, 
    LeadDetailSerializer,
    LeadCreateSerializer
)


class LeadViewSet(viewsets.ModelViewSet):
    """
    Complete CRUD operations for leads
    
    list: GET /api/leads/ - List all leads
    create: POST /api/leads/ - Create new lead
    retrieve: GET /api/leads/{id}/ - Get single lead
    update: PUT /api/leads/{id}/ - Update lead
    partial_update: PATCH /api/leads/{id}/ - Partial update
    destroy: DELETE /api/leads/{id}/ - Delete lead
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'company']
    ordering_fields = ['created_at', 'name', 'company', 'status']
    ordering = ['-created_at']  # Default ordering
    
    def get_queryset(self):
        """
        Filter leads to only show user's own leads
        Supports filtering by status and source
        """
        queryset = Lead.objects.filter(owner=self.request.user)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by source
        source_filter = self.request.query_params.get('source', None)
        if source_filter:
            queryset = queryset.filter(source=source_filter)
        
        return queryset
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return LeadListSerializer
        elif self.action == 'create':
            return LeadCreateSerializer
        return LeadDetailSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Create a new lead
        POST /api/leads/
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return full lead details using detail serializer
        lead = serializer.instance
        detail_serializer = LeadDetailSerializer(lead)
        
        return Response(
            detail_serializer.data,
            status=status.HTTP_201_CREATED
        )
    
    def list(self, request, *args, **kwargs):
        """
        List all leads with optional filtering
        GET /api/leads/
        Query params:
        - status: filter by status (new, contacted, in_progress, won, lost)
        - source: filter by source
        - search: search in name, email, company
        - ordering: order by field (e.g., -created_at)
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Get single lead details
        GET /api/leads/{id}/
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get lead statistics
        GET /api/leads/stats/
        """
        queryset = self.get_queryset()
        
        stats = {
            'total': queryset.count(),
            'by_status': {
                'new': queryset.filter(status='new').count(),
                'contacted': queryset.filter(status='contacted').count(),
                'in_progress': queryset.filter(status='in_progress').count(),
                'won': queryset.filter(status='won').count(),
                'lost': queryset.filter(status='lost').count(),
            },
            'by_source': {}
        }
        
        # Get source counts
        sources = queryset.values_list('source', flat=True).distinct()
        for source in sources:
            stats['by_source'][source] = queryset.filter(source=source).count()
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Get recent leads (last 10)
        GET /api/leads/recent/
        """
        queryset = self.get_queryset()[:10]
        serializer = LeadListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    
print(request.user)