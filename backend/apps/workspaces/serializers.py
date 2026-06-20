from rest_framework import serializers

from django.contrib.auth.models import User

from .models import AuditLog, Workspace, WorkspaceInvite, WorkspaceMembership


class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = ['id', 'name', 'slug', 'created_at']
        read_only_fields = fields


class WorkspaceMembershipSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = WorkspaceMembership
        fields = [
            'id',
            'user',
            'username',
            'email',
            'role',
            'role_display',
            'is_active',
            'joined_at',
        ]
        read_only_fields = ['id', 'user', 'username', 'email', 'role_display', 'joined_at']


class WorkspaceMembershipUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceMembership
        fields = ['role', 'is_active']

    def validate_role(self, value):
        membership = self.context.get('membership')
        instance = self.instance
        if (
            instance
            and instance.role == WorkspaceMembership.ROLE_ADMIN
            and value != WorkspaceMembership.ROLE_ADMIN
            and membership
            and membership.workspace.memberships.filter(
                role=WorkspaceMembership.ROLE_ADMIN,
                is_active=True,
            ).count() <= 1
        ):
            raise serializers.ValidationError('Cannot demote the only admin.')
        return value


class WorkspaceInviteSerializer(serializers.ModelSerializer):
    invited_by_name = serializers.CharField(source='invited_by.username', read_only=True)
    is_pending = serializers.BooleanField(read_only=True)

    class Meta:
        model = WorkspaceInvite
        fields = [
            'id',
            'email',
            'role',
            'token',
            'invited_by_name',
            'expires_at',
            'accepted_at',
            'is_pending',
            'created_at',
        ]
        read_only_fields = fields


class WorkspaceInviteCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(
        choices=[
            (WorkspaceMembership.ROLE_MANAGER, 'Manager'),
            (WorkspaceMembership.ROLE_MEMBER, 'Member'),
        ],
        default=WorkspaceMembership.ROLE_MEMBER,
    )


class AcceptInviteSerializer(serializers.Serializer):
    token = serializers.UUIDField()


class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.username', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'action',
            'entity_type',
            'entity_id',
            'changes',
            'actor',
            'actor_name',
            'created_at',
        ]
        read_only_fields = fields


class WhoAmIWorkspaceSerializer(serializers.Serializer):
    workspace = WorkspaceSerializer()
    role = serializers.CharField()
    role_display = serializers.CharField()
    permissions = serializers.DictField()
