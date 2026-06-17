from rest_framework import serializers
from .models import Lead, Note


class NoteSerializer(serializers.ModelSerializer):
    note_type_display = serializers.CharField(source='get_note_type_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Note
        fields = [
            'id',
            'note_type',
            'note_type_display',
            'content',
            'created_by',
            'created_by_name',
            'created_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_by_name', 'created_at']

    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Content cannot be empty.")
        return value.strip()


class BaseLeadSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    lost_reason_display = serializers.CharField(source='get_lost_reason_display', read_only=True)

    def validate_email(self, value):
        if value:
            request = self.context.get('request')
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

    def validate(self, attrs):
        status_value = attrs.get('status', getattr(self.instance, 'status', None))
        lost_reason = attrs.get('lost_reason', getattr(self.instance, 'lost_reason', None))
        deal_value = attrs.get('deal_value', getattr(self.instance, 'deal_value', None))

        if status_value == 'lost' and not lost_reason:
            raise serializers.ValidationError({'lost_reason': "This field is required when status is 'lost'."})

        if status_value != 'lost' and lost_reason:
            raise serializers.ValidationError({'lost_reason': "Lost reason must be blank unless status is 'lost'."})

        if deal_value is not None and deal_value < 0:
            raise serializers.ValidationError({'deal_value': 'Deal value must be greater than or equal to 0.'})

        return attrs


class LeadListSerializer(BaseLeadSerializer):
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
            'deal_value',
            'deal_currency',
            'expected_close_date',
            'assigned_to',
            'assigned_to_name',
            'lost_reason',
            'lost_reason_display',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class LeadDetailSerializer(BaseLeadSerializer):
    notes = NoteSerializer(many=True, read_only=True)

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
            'deal_value',
            'deal_currency',
            'expected_close_date',
            'assigned_to',
            'assigned_to_name',
            'lost_reason',
            'lost_reason_display',
            'created_at',
            'updated_at',
            'owner',
            'notes',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner']


class LeadCreateSerializer(BaseLeadSerializer):
    class Meta:
        model = Lead
        fields = [
            'name',
            'email',
            'phone',
            'company',
            'status',
            'source',
            'deal_value',
            'deal_currency',
            'expected_close_date',
            'assigned_to',
            'lost_reason',
        ]

    def create(self, validated_data):
        request_user = self.context['request'].user
        validated_data['owner'] = request_user
        validated_data.setdefault('assigned_to', request_user)
        return super().create(validated_data)