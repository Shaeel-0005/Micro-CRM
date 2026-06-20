from django.contrib import admin
from .models import AuditLog, Workspace, WorkspaceInvite, WorkspaceMembership


@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_by', 'created_at')
    search_fields = ('name', 'slug')


@admin.register(WorkspaceMembership)
class WorkspaceMembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'workspace', 'role', 'is_active', 'joined_at')
    list_filter = ('role', 'is_active')


@admin.register(WorkspaceInvite)
class WorkspaceInviteAdmin(admin.ModelAdmin):
    list_display = ('email', 'workspace', 'role', 'expires_at', 'accepted_at')
    list_filter = ('role',)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'entity_type', 'entity_id', 'actor', 'workspace', 'created_at')
    list_filter = ('action', 'entity_type')
