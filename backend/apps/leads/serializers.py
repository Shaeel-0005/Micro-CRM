"""
backend/apps/leads/serializers.py
Day 5: Fixed email uniqueness scoped to per-user leads
"""

from rest_framework import serializers
from .models import Lead


class LeadListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""

    class Meta:
        model = Lead
        fields = [
            'id',
            'name',
            'email',
            'company',
            'status',
            'source',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class LeadDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail/update views"""

    # Human-readable display values for choice fields
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    source_display = serializers.CharField(
        source='get_source_display',
        read_only=True
    )

    class Meta:
        model = Lead
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'company',
            'status',
            'status_display',
            'source',
            'source_display',
            'notes',
            'created_at',
            'updated_at',
            'owner',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner']

    def validate_email(self, value):
        """
        Ensure email is unique per user (case-insensitive).

        FIX: Previously checked across ALL users' leads, meaning
        two different freelancers could not share the same prospect email.
        Now scoped to the requesting user's leads only.
        """
        if value:
            request = self.context.get('request')
            instance = self.instance

            queryset = Lead.objects.filter(
                email__iexact=value,
                owner=request.user  # ✅ scoped to this user only
            )

            # Exclude current instance so updates don't self-conflict
            if instance:
                queryset = queryset.exclude(pk=instance.pk)

            if queryset.exists():
                raise serializers.ValidationError(
                    "You already have a lead with this email."
                )

        return value.lower() if value else value

    def validate_phone(self, value):
        """Basic phone number validation — must contain at least 10 digits."""
        if value:
            cleaned = ''.join(c for c in value if c.isdigit() or c == '+')
            if len(cleaned) < 10:
                raise serializers.ValidationError(
                    "Phone number must contain at least 10 digits."
                )
        return value


class LeadCreateSerializer(serializers.ModelSerializer):
    """
    Serializer specifically for creating new leads.
    Excludes owner from input — auto-assigned from the request user.
    """

    class Meta:
        model = Lead
        fields = [
            'name',
            'email',
            'phone',
            'company',
            'status',
            'source',
            'notes',
        ]

    def validate_email(self, value):
        """
        Same per-user uniqueness check applied at creation time.
        Reused here so POST and PUT/PATCH are both protected.
        """
        if value:
            request = self.context.get('request')

            queryset = Lead.objects.filter(
                email__iexact=value,
                owner=request.user  # ✅ scoped to this user only
            )

            if queryset.exists():
                raise serializers.ValidationError(
                    "You already have a lead with this email."
                )

        return value.lower() if value else value

    def validate_phone(self, value):
        """Basic phone number validation — must contain at least 10 digits."""
        if value:
            cleaned = ''.join(c for c in value if c.isdigit() or c == '+')
            if len(cleaned) < 10:
                raise serializers.ValidationError(
                    "Phone number must contain at least 10 digits."
                )
        return value

    def create(self, validated_data):
        """Auto-assign owner from the authenticated request user."""
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)