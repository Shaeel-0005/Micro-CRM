import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Workspace(models.Model):
    """Agency account — one workspace per agency in Phase 2."""

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_workspaces',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class WorkspaceMembership(models.Model):
    """Links a user to a workspace with a role."""

    ROLE_ADMIN = 'admin'
    ROLE_MANAGER = 'manager'
    ROLE_MEMBER = 'member'

    ROLE_CHOICES = [
        (ROLE_ADMIN, 'Admin'),
        (ROLE_MANAGER, 'Manager'),
        (ROLE_MEMBER, 'Member'),
    ]

    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='memberships',
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='workspace_memberships',
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_MEMBER)
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('workspace', 'user')]
        ordering = ['role', 'joined_at']

    def __str__(self):
        return f"{self.user.username} ({self.role}) @ {self.workspace.name}"


class WorkspaceInvite(models.Model):
    """Pending email invite to join a workspace."""

    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='invites',
    )
    email = models.EmailField()
    role = models.CharField(
        max_length=20,
        choices=WorkspaceMembership.ROLE_CHOICES,
        default=WorkspaceMembership.ROLE_MEMBER,
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    invited_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_invites',
    )
    expires_at = models.DateTimeField()
    accepted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def is_expired(self):
        return timezone.now() >= self.expires_at

    @property
    def is_pending(self):
        return self.accepted_at is None and not self.is_expired


class AuditLog(models.Model):
    """Tracks who changed what within a workspace."""

    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='audit_logs',
    )
    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_actions',
    )
    action = models.CharField(max_length=100)
    entity_type = models.CharField(max_length=50)
    entity_id = models.PositiveIntegerField()
    changes = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} on {self.entity_type}:{self.entity_id}"
