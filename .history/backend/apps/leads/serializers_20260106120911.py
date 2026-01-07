"""
backend/apps/leads/serializers.py
Day 4: Lead serializers for API
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
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class LeadDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail/create/update views"""
    
    # Add computed fields
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
            'owner'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'owner']
    
    def validate_email(self, value):
        """Ensure email is unique (case-insensitive)"""
        if value:
            # Check if email exists (excluding current instance during update)
            instance = self.instance
            queryset = Lead.objects.filter(email__iexact=value)
            if instance:
                queryset = queryset.exclude(pk=instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError(
                    "A lead with this email already exists."
                )
        return value.lower() if value else value
    
    def validate_phone(self, value):
        """Basic phone validation"""
        if value:
            # Remove common separators
            cleaned = ''.join(c for c in value if c.isdigit() or c == '+')
            if len(cleaned) < 10:
                raise serializers.ValidationError(
                    "Phone number must contain at least 10 digits."
                )
        return value


class LeadCreateSerializer(serializers.ModelSerializer):
    """Serializer specifically for creating new leads"""
    
    class Meta:
        model = Lead
        fields = [
            'name',
            'email',
            'phone',
            'company',
            'status',
            'source',
            'notes'
        ]
    
    def create(self, validated_data):
        """Auto-assign owner from request user"""
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)