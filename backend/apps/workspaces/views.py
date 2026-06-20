from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AuditLog, WorkspaceInvite, WorkspaceMembership
from .permissions import IsAdminOrManager, IsWorkspaceAdmin, IsWorkspaceMember
from .serializers import (
    AcceptInviteSerializer,
    AuditLogSerializer,
    WhoAmIWorkspaceSerializer,
    WorkspaceInviteCreateSerializer,
    WorkspaceInviteSerializer,
    WorkspaceMembershipSerializer,
    WorkspaceMembershipUpdateSerializer,
    WorkspaceSerializer,
)
from .services import (
    accept_invite,
    create_invite,
    get_active_membership,
    is_admin_or_manager,
    log_audit,
)


def _permission_flags(membership):
    role = membership.role
    is_admin = role == WorkspaceMembership.ROLE_ADMIN
    is_mgr = role in (WorkspaceMembership.ROLE_ADMIN, WorkspaceMembership.ROLE_MANAGER)
    return {
        'can_manage_team': is_admin,
        'can_assign_leads': is_mgr,
        'can_view_all_leads': is_mgr,
        'can_export_csv': is_mgr,
        'can_view_audit_log': is_mgr,
        'can_manage_invites': is_admin,
    }


class WorkspaceMeView(APIView):
    permission_classes = [IsAuthenticated, IsWorkspaceMember]

    def get(self, request):
        membership = get_active_membership(request.user)
        data = {
            'workspace': WorkspaceSerializer(membership.workspace).data,
            'role': membership.role,
            'role_display': membership.get_role_display(),
            'permissions': _permission_flags(membership),
        }
        return Response(data)


class WorkspaceMemberViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsWorkspaceMember]
    serializer_class = WorkspaceMembershipSerializer
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_queryset(self):
        membership = get_active_membership(self.request.user)
        return WorkspaceMembership.objects.filter(
            workspace=membership.workspace,
        ).select_related('user')

    def get_permissions(self):
        if self.action in ('partial_update', 'update'):
            return [IsAuthenticated(), IsWorkspaceAdmin()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action in ('partial_update', 'update'):
            return WorkspaceMembershipUpdateSerializer
        return WorkspaceMembershipSerializer

    def partial_update(self, request, *args, **kwargs):
        actor_membership = get_active_membership(request.user)
        instance = self.get_object()
        serializer = WorkspaceMembershipUpdateSerializer(
            instance,
            data=request.data,
            partial=True,
            context={'membership': actor_membership, 'request': request},
        )
        serializer.is_valid(raise_exception=True)
        old_role = instance.role
        serializer.save()
        if old_role != instance.role:
            log_audit(
                actor_membership.workspace,
                request.user,
                'membership.role_changed',
                'membership',
                instance.id,
                {'from': old_role, 'to': instance.role},
            )
        return Response(WorkspaceMembershipSerializer(instance).data)


class WorkspaceInviteViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsWorkspaceAdmin]

    def list(self, request):
        membership = get_active_membership(request.user)
        invites = membership.workspace.invites.filter(accepted_at__isnull=True)
        return Response(WorkspaceInviteSerializer(invites, many=True).data)

    def create(self, request):
        membership = get_active_membership(request.user)
        serializer = WorkspaceInviteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            invite = create_invite(
                membership.workspace,
                serializer.validated_data['email'],
                serializer.validated_data['role'],
                request.user,
            )
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        log_audit(
            membership.workspace,
            request.user,
            'invite.created',
            'invite',
            invite.id,
            {'email': invite.email, 'role': invite.role},
        )
        return Response(WorkspaceInviteSerializer(invite).data, status=status.HTTP_201_CREATED)


class AcceptInviteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AcceptInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            membership = accept_invite(serializer.validated_data['token'], request.user)
        except WorkspaceInvite.DoesNotExist:
            return Response({'detail': 'Invalid invite token.'}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        log_audit(
            membership.workspace,
            request.user,
            'invite.accepted',
            'membership',
            membership.id,
            {'email': request.user.email},
        )
        return Response(WorkspaceMembershipSerializer(membership).data)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminOrManager]
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        membership = get_active_membership(self.request.user)
        if not membership:
            return AuditLog.objects.none()
        return AuditLog.objects.filter(workspace=membership.workspace).select_related('actor')
