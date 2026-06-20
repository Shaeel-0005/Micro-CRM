import csv
from datetime import timedelta
from decimal import Decimal
from io import StringIO

from django.db.models import Sum
from django.db.models.functions import Coalesce
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, filters, status, serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.reminders.models import Reminder
from apps.workspaces.models import WorkspaceMembership
from apps.workspaces.permissions import IsAdminOrManager
from apps.workspaces.services import (
    get_active_membership,
    leads_queryset_for_user,
    log_audit,
)
from .models import Lead, LeadTag, Note, Proposal, SavedView
from .serializers import (
    LeadListSerializer,
    LeadDetailSerializer,
    LeadCreateSerializer,
    LeadTagSerializer,
    NoteSerializer,
    ProposalSerializer,
    SavedViewSerializer,
)


class LeadViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'company', 'phone']
    ordering_fields = ['created_at', 'name', 'company', 'status', 'deal_value', 'expected_close_date']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = leads_queryset_for_user(self.request.user)

        for param, field in [
            ('status', 'status'),
            ('source', 'source'),
            ('assigned_to', 'assigned_to_id'),
            ('lost_reason', 'lost_reason'),
        ]:
            value = self.request.query_params.get(param)
            if value:
                queryset = queryset.filter(**{field: value})

        tag = self.request.query_params.get('tag')
        if tag:
            queryset = queryset.filter(tags__id=tag)

        return queryset.distinct()

    def get_serializer_class(self):
        if self.action == 'list':
            return LeadListSerializer
        if self.action == 'create':
            return LeadCreateSerializer
        return LeadDetailSerializer

    def perform_create(self, serializer):
        lead = serializer.save()
        membership = get_active_membership(self.request.user)
        log_audit(
            membership.workspace, self.request.user,
            'lead.created', 'lead', lead.id,
            {'name': lead.name, 'status': lead.status},
        )

    def perform_update(self, serializer):
        instance = self.instance
        old = {
            'status': instance.status,
            'assigned_to_id': instance.assigned_to_id,
            'deal_value': str(instance.deal_value) if instance.deal_value else None,
        }
        lead = serializer.save()
        changes = {}
        for key, old_val in old.items():
            new_val = getattr(lead, key if key != 'assigned_to_id' else 'assigned_to_id')
            if str(old_val) != str(new_val):
                changes[key] = {'from': old_val, 'to': new_val}
        if changes:
            membership = get_active_membership(self.request.user)
            log_audit(
                membership.workspace, self.request.user,
                'lead.updated', 'lead', lead.id, changes,
            )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        detail = LeadDetailSerializer(serializer.instance, context={'request': request})
        return Response(detail.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsAdminOrManager])
    def export_csv(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow([
            'id', 'name', 'email', 'phone', 'company', 'status', 'source',
            'deal_value', 'deal_currency', 'expected_close_date', 'assigned_to', 'lost_reason',
        ])
        for lead in queryset:
            writer.writerow([
                lead.id, lead.name, lead.email or '', lead.phone or '', lead.company or '',
                lead.status, lead.source,
                lead.deal_value or '', lead.deal_currency,
                lead.expected_close_date or '',
                lead.assigned_to.username if lead.assigned_to else '',
                lead.lost_reason or '',
            ])
        response = HttpResponse(buffer.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="leads_export.csv"'
        membership = get_active_membership(request.user)
        log_audit(membership.workspace, request.user, 'lead.export_csv', 'lead', 0, {'count': queryset.count()})
        return response

    @action(detail=False, methods=['get'])
    def stats(self, request):
        queryset = self.get_queryset()
        data = {
            'total': queryset.count(),
            'by_status': {
                s: queryset.filter(status=s).count()
                for s in ['new_lead', 'discovery_call', 'proposal_sent', 'negotiation', 'won', 'lost']
            },
            'by_source': {},
        }
        for source in queryset.values_list('source', flat=True).distinct():
            data['by_source'][source] = queryset.filter(source=source).count()
        return Response(data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        queryset = self.get_queryset()[:10]
        return Response(LeadListSerializer(queryset, many=True, context={'request': request}).data)

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
        membership = get_active_membership(request.user)
        overdue_qs = Reminder.objects.filter(is_completed=False, reminder_date__lt=now)
        if membership and membership.role == WorkspaceMembership.ROLE_MEMBER:
            overdue_qs = overdue_qs.filter(owner=request.user)
        else:
            member_ids = membership.workspace.memberships.filter(is_active=True).values_list('user_id', flat=True)
            overdue_qs = overdue_qs.filter(owner_id__in=member_ids)
        lost_reasons = {
            key: queryset.filter(status='lost', lost_reason=key).count()
            for key, _ in Lead.LOST_REASON_CHOICES
        }
        return Response({
            'pipeline_value': {'PKR': str(pkr_total), 'USD': str(usd_total)},
            'deals_closing_this_month': queryset.filter(
                expected_close_date__gte=month_start,
                expected_close_date__lt=next_month,
            ).count(),
            'overdue_follow_ups': overdue_qs.count(),
            'lost_reasons': lost_reasons,
        })


class NoteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NoteSerializer
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def _get_lead(self):
        return get_object_or_404(
            leads_queryset_for_user(self.request.user),
            pk=self.kwargs['lead_pk'],
        )

    def get_queryset(self):
        return Note.objects.filter(lead=self._get_lead())

    def perform_create(self, serializer):
        lead = self._get_lead()
        serializer.save(lead=lead, created_by=self.request.user)


class LeadTagViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = LeadTagSerializer

    def get_queryset(self):
        membership = get_active_membership(self.request.user)
        if not membership:
            return LeadTag.objects.none()
        return LeadTag.objects.filter(workspace=membership.workspace)

    def perform_create(self, serializer):
        membership = get_active_membership(self.request.user)
        serializer.save(workspace=membership.workspace)


class SavedViewViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SavedViewSerializer

    def get_queryset(self):
        membership = get_active_membership(self.request.user)
        if not membership:
            return SavedView.objects.none()
        from django.db.models import Q
        return SavedView.objects.filter(
            workspace=membership.workspace,
        ).filter(Q(user=self.request.user) | Q(is_shared=True))

    def perform_create(self, serializer):
        membership = get_active_membership(self.request.user)
        serializer.save(workspace=membership.workspace, user=self.request.user)


class ProposalViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProposalSerializer

    def get_queryset(self):
        membership = get_active_membership(self.request.user)
        if not membership:
            return Proposal.objects.none()
        qs = Proposal.objects.filter(workspace=membership.workspace).select_related('lead', 'created_by')
        if membership.role == WorkspaceMembership.ROLE_MEMBER:
            lead_ids = leads_queryset_for_user(self.request.user).values_list('id', flat=True)
            qs = qs.filter(lead_id__in=lead_ids)
        lead_id = self.request.query_params.get('lead')
        if lead_id:
            qs = qs.filter(lead_id=lead_id)
        return qs

    def perform_create(self, serializer):
        membership = get_active_membership(self.request.user)
        lead = serializer.validated_data['lead']
        if lead.workspace_id != membership.workspace_id:
            raise serializers.ValidationError({'lead': 'Lead not in your workspace.'})
        proposal = serializer.save(
            workspace=membership.workspace,
            created_by=self.request.user,
        )
        if proposal.status == 'sent' and not proposal.sent_at:
            proposal.sent_at = timezone.now()
            proposal.save(update_fields=['sent_at'])

    def perform_update(self, serializer):
        proposal = serializer.save()
        if proposal.status == 'sent' and not proposal.sent_at:
            proposal.sent_at = timezone.now()
            proposal.save(update_fields=['sent_at'])
