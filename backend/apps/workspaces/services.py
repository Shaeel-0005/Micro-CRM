import uuid
from datetime import timedelta

from django.contrib.auth.models import User
from django.db.models import Q
from django.utils import timezone
from django.utils.text import slugify

from apps.leads.models import Lead
from .models import AuditLog, Workspace, WorkspaceInvite, WorkspaceMembership


def unique_workspace_slug(base: str) -> str:
    slug = slugify(base) or 'workspace'
    candidate = slug
    counter = 1
    while Workspace.objects.filter(slug=candidate).exists():
        candidate = f'{slug}-{counter}'
        counter += 1
    return candidate


def create_workspace_for_user(user, name=None) -> WorkspaceMembership:
    """Create a workspace and make the user its admin."""
    display_name = name or f"{user.username}'s Agency"
    workspace = Workspace.objects.create(
        name=display_name,
        slug=unique_workspace_slug(display_name),
        created_by=user,
    )
    return WorkspaceMembership.objects.create(
        workspace=workspace,
        user=user,
        role=WorkspaceMembership.ROLE_ADMIN,
    )


def get_active_membership(user):
    if not user or not user.is_authenticated:
        return None
    return (
        WorkspaceMembership.objects
        .filter(user=user, is_active=True)
        .select_related('workspace')
        .order_by('-joined_at')
        .first()
    )


def user_has_role(user, *roles) -> bool:
    membership = get_active_membership(user)
    return bool(membership and membership.role in roles)


def is_admin_or_manager(user) -> bool:
    return user_has_role(
        user,
        WorkspaceMembership.ROLE_ADMIN,
        WorkspaceMembership.ROLE_MANAGER,
    )


def leads_queryset_for_user(user):
    """Return leads visible to the user based on workspace role."""
    membership = get_active_membership(user)
    if not membership:
        return Lead.objects.none()

    queryset = Lead.objects.filter(workspace=membership.workspace)
    if membership.role == WorkspaceMembership.ROLE_MEMBER:
        queryset = queryset.filter(Q(assigned_to=user) | Q(owner=user))
    return queryset


def get_lead_for_user(user, lead_id):
    return get_object_or_404_helper(leads_queryset_for_user(user), pk=lead_id)


def get_object_or_404_helper(queryset, **kwargs):
    from django.shortcuts import get_object_or_404
    return get_object_or_404(queryset, **kwargs)


def workspace_member_ids(workspace) -> set:
    return set(
        WorkspaceMembership.objects
        .filter(workspace=workspace, is_active=True)
        .values_list('user_id', flat=True)
    )


def validate_assignee(user, assignee_id):
    """Ensure assigned_to is an active member of the same workspace."""
    if assignee_id is None:
        return None
    membership = get_active_membership(user)
    if not membership:
        raise ValueError('No workspace membership')
    member_ids = workspace_member_ids(membership.workspace)
    if int(assignee_id) not in member_ids:
        raise ValueError('Assignee must be a workspace member')
    return assignee_id


def log_audit(workspace, actor, action, entity_type, entity_id, changes=None):
    return AuditLog.objects.create(
        workspace=workspace,
        actor=actor,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        changes=changes or {},
    )


def create_invite(workspace, email, role, invited_by, days_valid=7):
    email = email.strip().lower()
    if WorkspaceMembership.objects.filter(
        workspace=workspace,
        user__email__iexact=email,
        is_active=True,
    ).exists():
        raise ValueError('User is already a member of this workspace')

    WorkspaceInvite.objects.filter(
        workspace=workspace,
        email__iexact=email,
        accepted_at__isnull=True,
    ).delete()

    return WorkspaceInvite.objects.create(
        workspace=workspace,
        email=email,
        role=role,
        invited_by=invited_by,
        expires_at=timezone.now() + timedelta(days=days_valid),
    )


def accept_invite(token, user):
    invite = WorkspaceInvite.objects.select_related('workspace').get(token=token)
    if invite.accepted_at:
        raise ValueError('Invite already accepted')
    if invite.is_expired:
        raise ValueError('Invite has expired')
    if user.email.lower() != invite.email.lower():
        raise ValueError('Invite email does not match your account')

    # A user should only ever have one active membership at a time.
    # Deactivate any existing active memberships (e.g. their own
    # auto-created personal workspace from signup) before activating
    # the one they're accepting now.
    WorkspaceMembership.objects.filter(
        user=user, is_active=True
    ).exclude(workspace=invite.workspace).update(is_active=False)

    membership, created = WorkspaceMembership.objects.update_or_create(
        workspace=invite.workspace,
        user=user,
        defaults={'role': invite.role, 'is_active': True},
    )
    invite.accepted_at = timezone.now()
    invite.save(update_fields=['accepted_at'])
    return membership