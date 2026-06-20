"""
Migration audit — Phase 1 Note replaced LeadActivity (migration 0003).
"""

from pathlib import Path

from django.apps import apps as django_apps
from django.db import connection
from django.test import TestCase


class MigrationSchemaTests(TestCase):
    """On a fully migrated DB, legacy LeadActivity must be gone."""

    def test_leadactivity_table_absent(self):
        tables = connection.introspection.table_names()
        self.assertNotIn('leads_leadactivity', tables)

    def test_lead_has_no_inline_notes_field(self):
        Lead = django_apps.get_model('leads', 'Lead')
        local_field_names = {f.name for f in Lead._meta.local_fields}
        self.assertNotIn('notes', local_field_names)

    def test_note_model_registered(self):
        Note = django_apps.get_model('leads', 'Note')
        field_names = {f.name for f in Note._meta.local_fields}
        self.assertTrue({'lead', 'created_by', 'note_type', 'content', 'created_at'} <= field_names)


class Migration0003DefinitionTests(TestCase):
    """Static audit of migration 0003 — backfill + delete LeadActivity."""

    def test_0003_backfills_activities_and_drops_leadactivity(self):
        migration_path = (
            Path(__file__).resolve().parent / 'migrations' / '0003_phase1_schema.py'
        )
        content = migration_path.read_text(encoding='utf-8')
        self.assertIn('def migrate_activities_to_notes', content)
        self.assertIn('LeadActivity', content)
        self.assertIn('DeleteModel', content)
        self.assertIn("name='LeadActivity'", content)
