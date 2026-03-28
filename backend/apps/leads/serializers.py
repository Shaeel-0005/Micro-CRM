"""
backend/apps/leads/serializers.py
Day 8: Added LeadActivitySerializer
"""

from rest_framework import serializers
from .models import Lead, LeadActivity


# ─── Activity Serializer ──────────────────────────────────────────────────────

class LeadActivitySerializer(serializers.ModelSerializer):
    """Serializer for reading and creating lead activities."""

    activity_type_display = serializers.CharField(
        source='get_activity_type_display',
        read_only=True
    )

    class Meta:
        model  = LeadActivity
        fields = [
            'id',
            'activity_type',
            'activity_type_display',
            'description',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate_description(self, value):
        """Description cannot be blank."""
        if not value or not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        return value.strip()


# ─── Lead Serializers ─────────────────────────────────────────────────────────

class LeadListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""

    class Meta:
        model  = Lead
        fields = ['id', 'name', 'email', 'company', 'status', 'source', 'created_at']
        read_only_fields = ['id', 'created_at']


class LeadDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail/update views — includes nested activities."""

    status_display = serializers.CharField(source='get_status_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    activities     = LeadActivitySerializer(many=True, read_only=True)

    class Meta:
        model  = Lead
        fields = [
            'id', 'name', 'email', 'phone', 'company',
            'status', 'status_display',
            'source', 'source_display',
            'notes', 'created_at', 'updated_at', 'owner',
            'activities',          # ← nested activity log
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner']

    def validate_email(self, value):
        if value:
            request  = self.context.get('request')
            instance = self.instance
            queryset = Lead.objects.filter(email__iexact=value, owner=request.user)
            if instance:
                queryset = queryset.exclude(pk=instance.pk)
            if queryset.exists():
                raise serializers.ValidationError("You already have a lead with this email.")
        return value.lower() if value else value

    def validate_phone(self, value):
        if value:
            cleaned = ''.join(c for c in value if c.isdigit() or c == '+')
            if len(cleaned) < 10:
                raise serializers.ValidationError("Phone number must contain at least 10 digits.")
        return value


class LeadCreateSerializer(serializers.ModelSerializer):
    """Serializer specifically for creating new leads."""

    class Meta:
        model  = Lead
        fields = ['name', 'email', 'phone', 'company', 'status', 'source', 'notes']

    def validate_email(self, value):
        if value:
            request  = self.context.get('request')
            queryset = Lead.objects.filter(email__iexact=value, owner=request.user)
            if queryset.exists():
                raise serializers.ValidationError("You already have a lead with this email.")
        return value.lower() if value else value

    def validate_phone(self, value):
        if value:
            cleaned = ''.join(c for c in value if c.isdigit() or c == '+')
            if len(cleaned) < 10:
                raise serializers.ValidationError("Phone number must contain at least 10 digits.")
        return value

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)