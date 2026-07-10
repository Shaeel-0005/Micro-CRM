from collections import defaultdict

from django.core.management.base import BaseCommand

from apps.workspaces.models import WorkspaceMembership


class Command(BaseCommand):
    help = (
        "One-off data fix for accounts that ended up with more than one "
        "active WorkspaceMembership (pre-dates the accept_invite fix). "
        "Keeps the most recently joined membership active per user and "
        "deactivates the rest."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would change without writing to the database.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']

        by_user = defaultdict(list)
        for m in WorkspaceMembership.objects.filter(is_active=True).select_related('user', 'workspace'):
            by_user[m.user_id].append(m)

        affected = {uid: ms for uid, ms in by_user.items() if len(ms) > 1}

        if not affected:
            self.stdout.write(self.style.SUCCESS("No users with duplicate active memberships found."))
            return

        for uid, memberships in affected.items():
            memberships.sort(key=lambda m: m.joined_at, reverse=True)
            keep, drop = memberships[0], memberships[1:]
            user = keep.user
            self.stdout.write(
                f"{user.username}: keeping '{keep.workspace.name}' ({keep.role}), "
                f"deactivating {[m.workspace.name for m in drop]}"
            )
            if not dry_run:
                for m in drop:
                    m.is_active = False
                    m.save(update_fields=['is_active'])

        verb = "Would fix" if dry_run else "Fixed"
        self.stdout.write(self.style.SUCCESS(f"{verb} {len(affected)} user(s)."))