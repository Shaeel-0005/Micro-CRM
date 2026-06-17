from datetime import timedelta
from decimal import Decimal
from django.db.models import Sum
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.reminders.models import Reminder
from .models import Lead, Note
from .serializers import (
    LeadListSerializer,
    LeadDetailSerializer,
    LeadCreateSerializer,
    NoteSerializer,
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
    search_fields      = ['name', 'email', 'company', 'phone']
    ordering_fields    = ['created_at', 'name', 'company', 'status', 'deal_value', 'expected_close_date']
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

        assigned_filter = self.request.query_params.get('assigned_to')
        if assigned_filter:
            queryset = queryset.filter(assigned_to_id=assigned_filter)

        lost_reason_filter = self.request.query_params.get('lost_reason')
        if lost_reason_filter:
            queryset = queryset.filter(lost_reason=lost_reason_filter)

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
                'new_lead': queryset.filter(status='new_lead').count(),
                'discovery_call': queryset.filter(status='discovery_call').count(),
                'proposal_sent': queryset.filter(status='proposal_sent').count(),
                'negotiation': queryset.filter(status='negotiation').count(),
                'won': queryset.filter(status='won').count(),
                'lost': queryset.filter(status='lost').count(),
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

    @action(detail=False, methods=['get'])
    def money_stats(self, request):
        queryset = self.get_queryset()
        open_deals = queryset.exclude(status__in=['won', 'lost'])

        pkr_total = open_deals.filter(deal_currency='PKR').aggregate(
            total=Coalesce(Sum('deal_value'), Decimal('0'))
        )['total']
        usd_total = open_deals.filter(deal_currency='USD').aggregate(
            total=Coalesce(Sum('deal_value'), Decimal('0'))
        )['total']

        now = timezone.now()
        month_start = now.date().replace(day=1)
        next_month = (month_start + timedelta(days=32)).replace(day=1)

        deals_closing_this_month = queryset.filter(
            expected_close_date__gte=month_start,
            expected_close_date__lt=next_month
        ).count()

        overdue_follow_ups = Reminder.objects.filter(
            owner=request.user,
            is_completed=False,
            reminder_date__lt=now
        ).count()

        lost_reasons = {}
        for key, _label in Lead.LOST_REASON_CHOICES:
            lost_reasons[key] = queryset.filter(status='lost', lost_reason=key).count()

        return Response({
            'pipeline_value': {
                'PKR': str(pkr_total),
                'USD': str(usd_total),
            },
            'deals_closing_this_month': deals_closing_this_month,
            'overdue_follow_ups': overdue_follow_ups,
            'lost_reasons': lost_reasons,
        })


# ─── Note ViewSet ─────────────────────────────────────────────────────────────

class NoteViewSet(viewsets.ModelViewSet):
    """
    CRUD for notes nested under a lead.

    list:    GET    /api/leads/{lead_id}/notes/
    create:  POST   /api/leads/{lead_id}/notes/
    destroy: DELETE /api/leads/{lead_id}/notes/{id}/

    Update is intentionally excluded — activities are immutable once logged.
    """
    permission_classes = [IsAuthenticated]
    serializer_class   = NoteSerializer
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
        return Note.objects.filter(lead=lead)

    def perform_create(self, serializer):
        lead = self._get_lead()
        serializer.save(lead=lead, created_by=self.request.user)