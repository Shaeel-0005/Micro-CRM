from rest_framework import permissions

from .models import WorkspaceMembership
from .services import get_active_membership, is_admin_or_manager


class IsWorkspaceMember(permissions.BasePermission):
    def has_permission(self, request, view):
        return get_active_membership(request.user) is not None


class IsAdminOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return is_admin_or_manager(request.user)


class IsWorkspaceAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        membership = get_active_membership(request.user)
        return bool(membership and membership.role == WorkspaceMembership.ROLE_ADMIN)
