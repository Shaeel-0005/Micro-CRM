# Data migration: create workspace per existing user and assign leads

from django.db import migrations


def backfill_workspaces(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    Workspace = apps.get_model('workspaces', 'Workspace')
    WorkspaceMembership = apps.get_model('workspaces', 'WorkspaceMembership')
    Lead = apps.get_model('leads', 'Lead')

    def unique_slug(base):
        slug = base.lower().replace(' ', '-').replace("'", '')[:200] or 'workspace'
        candidate = slug
        counter = 1
        while Workspace.objects.filter(slug=candidate).exists():
            candidate = f'{slug}-{counter}'
            counter += 1
        return candidate

    for user in User.objects.all():
        membership = WorkspaceMembership.objects.filter(user=user, is_active=True).first()
        if not membership:
            name = f"{user.username}'s Agency"
            workspace = Workspace.objects.create(
                name=name,
                slug=unique_slug(name),
                created_by_id=user.id,
            )
            membership = WorkspaceMembership.objects.create(
                workspace=workspace,
                user=user,
                role='admin',
                is_active=True,
            )
        Lead.objects.filter(owner_id=user.id, workspace__isnull=True).update(
            workspace_id=membership.workspace_id
        )


class Migration(migrations.Migration):

    dependencies = [
        ('leads', '0004_lead_workspace_leadtag_lead_tags_proposal_savedview'),
        ('workspaces', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(backfill_workspaces, migrations.RunPython.noop),
    ]
