"""
Verify Phase 1 Note migration: LeadActivity removed, Note model in use.

Run on any environment (local or production):
    python manage.py audit_note_migration
"""

from django.apps import apps
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Audit Phase 1 Note migration — confirm LeadActivity is gone and Notes are healthy.'

    def handle(self, *args, **options):
        tables = connection.introspection.table_names()
        legacy_table = 'leads_leadactivity' in tables

        Lead = apps.get_model('leads', 'Lead')
        Note = apps.get_model('leads', 'Note')
        local_fields = {f.name for f in Lead._meta.local_fields}

        lead_count = Lead.objects.count()
        note_count = Note.objects.count()
        leads_with_notes = Lead.objects.filter(notes__isnull=False).distinct().count()

        issues = []
        if legacy_table:
            issues.append(
                'leads_leadactivity table still exists — run: python manage.py migrate leads'
            )
        if 'notes' in local_fields:
            issues.append('Lead still has legacy inline notes field')
        if not apps.get_model('leads', 'Note'):
            issues.append('Note model missing')

        self.stdout.write('Phase 1 Note migration audit')
        self.stdout.write(f'  Leads: {lead_count}')
        self.stdout.write(f'  Notes: {note_count}')
        self.stdout.write(f'  Leads with notes: {leads_with_notes}')
        self.stdout.write(f'  LeadActivity table present: {legacy_table}')
        self.stdout.write(f'  Legacy Lead.notes field present: {"notes" in local_fields}')

        if issues:
            for msg in issues:
                self.stderr.write(self.style.ERROR(f'FAIL: {msg}'))
            raise SystemExit(1)

        self.stdout.write(self.style.SUCCESS('OK - Note migration looks healthy.'))
