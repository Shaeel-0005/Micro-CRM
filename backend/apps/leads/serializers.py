import csv
from io import StringIO

from rest_framework import serializers

from apps.workspaces.models import WorkspaceMembership
from apps.workspaces.services import (
    get_active_membership,
    validate_assignee,
    workspace_member_ids,
)
from .models import Lead, LeadTag, Note, Proposal, SavedView


class NoteSerializer(serializers.ModelSerializer):
    note_type_display = serializers.CharField(source='get_note_type_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Note
        fields = [
            'id', 'note_type', 'note_type_display', 'content',
            'created_by', 'created_by_name', 'created_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_by_name', 'created_at']

    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Content cannot be empty.")
        return value.strip()


class LeadTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadTag
        fields = ['id', 'name', 'color']
        read_only_fields = ['id']


class SavedViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedView
        fields = ['id', 'name', 'filters', 'is_shared', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProposalSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    lead_name = serializers.CharField(source='lead.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Proposal
        fields = [
            'id', 'lead', 'lead_name', 'title', 'status', 'status_display',
            'content', 'sent_at', 'created_by', 'created_by_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_by_name', 'created_at', 'updated_at']


class BaseLeadSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    lost_reason_display = serializers.CharField(source='get_lost_reason_display', read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=LeadTag.objects.all(), source='tags', required=False
    )
    tags = LeadTagSerializer(many=True, read_only=True)

    def _workspace(self):
        request = self.context.get('request')
        membership = get_active_membership(request.user) if request else None
        return membership.workspace if membership else None

    def validate_email(self, value):
        if value:
            request = self.context.get('request')
            workspace = self._workspace()
            instance = self.instance
            queryset = Lead.objects.filter(email__iexact=value, workspace=workspace)
            if instance:
                queryset = queryset.exclude(pk=instance.pk)
            if queryset.exists():
                raise serializers.ValidationError("A lead with this email already exists in your workspace.")
        return value.lower() if value else value

    def validate_phone(self, value):
        if value:
            cleaned = ''.join(c for c in value if c.isdigit() or c == '+')
            if len(cleaned) < 10:
                raise serializers.ValidationError("Phone number must contain at least 10 digits.")
        return value

    def validate_assigned_to(self, value):
        request = self.context.get('request')
        membership = get_active_membership(request.user)
        if value and membership:
            if value.id not in workspace_member_ids(membership.workspace):
                raise serializers.ValidationError("Assignee must be a workspace member.")
            if membership.role == WorkspaceMembership.ROLE_MEMBER and value != request.user:
                raise serializers.ValidationError("Members can only assign leads to themselves.")
        return value

    def validate(self, attrs):
        status_value = attrs.get('status', getattr(self.instance, 'status', None))
        lost_reason = attrs.get('lost_reason', getattr(self.instance, 'lost_reason', None))
        deal_value = attrs.get('deal_value', getattr(self.instance, 'deal_value', None))

        if status_value == 'lost' and not lost_reason:
            raise serializers.ValidationError({'lost_reason': "Required when status is 'lost'."})
        if status_value != 'lost':
            attrs['lost_reason'] = None
        if deal_value is not None and deal_value < 0:
            raise serializers.ValidationError({'deal_value': 'Must be >= 0.'})
        return attrs


class LeadListSerializer(BaseLeadSerializer):
    class Meta:
        model = Lead
        fields = [
            'id', 'name', 'email', 'phone', 'company', 'status', 'status_display',
            'source', 'source_display', 'deal_value', 'deal_currency',
            'expected_close_date', 'assigned_to', 'assigned_to_name',
            'lost_reason', 'lost_reason_display', 'tags', 'tag_ids', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'tags']


class LeadDetailSerializer(BaseLeadSerializer):
    notes = NoteSerializer(many=True, read_only=True)

    class Meta:
        model = Lead
        fields = [
            'id', 'name', 'email', 'phone', 'company', 'status', 'status_display',
            'source', 'source_display', 'deal_value', 'deal_currency',
            'expected_close_date', 'assigned_to', 'assigned_to_name',
            'lost_reason', 'lost_reason_display', 'tags', 'tag_ids',
            'created_at', 'updated_at', 'owner', 'notes',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner', 'notes', 'tags']


class LeadCreateSerializer(BaseLeadSerializer):
    class Meta:
        model = Lead
        fields = [
            'name', 'email', 'phone', 'company', 'status', 'source',
            'deal_value', 'deal_currency', 'expected_close_date',
            'assigned_to', 'lost_reason', 'tag_ids',
        ]

    def create(self, validated_data):
        request_user = self.context['request'].user
        membership = get_active_membership(request_user)
        tags = validated_data.pop('tags', [])
        validated_data['owner'] = request_user
        validated_data['workspace'] = membership.workspace
        validated_data.setdefault('assigned_to', request_user)
        lead = super().create(validated_data)
        if tags:
            lead.tags.set(tags)
        return lead
