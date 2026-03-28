"""
apps/reminders/serializers.py
Day 9: Reminder serializer with lead name included for display.
"""

from rest_framework import serializers
from django.utils import timezone
from .models import Reminder


class ReminderSerializer(serializers.ModelSerializer):
    """Full serializer for reminders."""

    lead_name    = serializers.CharField(source='lead.name',    read_only=True)
    lead_company = serializers.CharField(source='lead.company', read_only=True)
    is_overdue   = serializers.SerializerMethodField()

    class Meta:
        model  = Reminder
        fields = [
            'id', 'title', 'message', 'reminder_date',
            'is_completed', 'lead', 'lead_name', 'lead_company',
            'is_overdue', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'is_overdue']

    def get_is_overdue(self, obj):
        return not obj.is_completed and obj.reminder_date < timezone.now()

    def validate_reminder_date(self, value):
        """Only enforce future date on create, not update."""
        if self.instance is None and value < timezone.now():
            raise serializers.ValidationError("Reminder date must be in the future.")
        return value

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value.strip()

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class ReminderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views and badge counts."""

    lead_name  = serializers.CharField(source='lead.name', read_only=True)
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model  = Reminder
        fields = ['id', 'title', 'reminder_date', 'is_completed', 'lead', 'lead_name', 'is_overdue']

    def get_is_overdue(self, obj):
        return not obj.is_completed and obj.reminder_date < timezone.now()