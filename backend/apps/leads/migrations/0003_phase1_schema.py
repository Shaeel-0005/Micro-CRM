# Generated manually for Phase 1 schema alignment

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


STATUS_MAP = {
    'new': 'new_lead',
    'contacted': 'discovery_call',
    'in_progress': 'proposal_sent',
    'won': 'won',
    'lost': 'lost',
}

SOURCE_MAP = {
    'linkedin': 'linkedin',
    'email': 'cold_outreach',
    'referral': 'referral',
    'website': 'website',
    'other': 'website',
}

ACTIVITY_TYPE_MAP = {
    'note': 'general',
    'call': 'call',
    'email': 'email',
    'meeting': 'general',
}


def migrate_status_and_source(apps, schema_editor):
    Lead = apps.get_model('leads', 'Lead')
    for lead in Lead.objects.all():
        if lead.status in STATUS_MAP:
            lead.status = STATUS_MAP[lead.status]
        if lead.source in SOURCE_MAP:
            lead.source = SOURCE_MAP[lead.source]
        lead.save(update_fields=['status', 'source'])


def migrate_activities_to_notes(apps, schema_editor):
    Lead = apps.get_model('leads', 'Lead')
    LeadActivity = apps.get_model('leads', 'LeadActivity')
    Note = apps.get_model('leads', 'Note')

    for activity in LeadActivity.objects.select_related('lead').all():
        note_type = ACTIVITY_TYPE_MAP.get(activity.activity_type, 'general')
        Note.objects.create(
            lead=activity.lead,
            created_by=activity.lead.owner,
            note_type=note_type,
            content=activity.description,
            created_at=activity.created_at,
        )

    for lead in Lead.objects.exclude(notes='').exclude(notes__isnull=True):
        if lead.notes and lead.notes.strip():
            Note.objects.create(
                lead=lead,
                created_by=lead.owner,
                note_type='general',
                content=lead.notes.strip(),
            )


def set_assigned_to_owner(apps, schema_editor):
    Lead = apps.get_model('leads', 'Lead')
    for lead in Lead.objects.filter(assigned_to__isnull=True):
        lead.assigned_to_id = lead.owner_id
        lead.save(update_fields=['assigned_to'])


class Migration(migrations.Migration):

    dependencies = [
        ('leads', '0002_lead_notes'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='lead',
            name='assigned_to',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='assigned_leads',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='lead',
            name='deal_value',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='deal_currency',
            field=models.CharField(
                choices=[('PKR', 'PKR'), ('USD', 'USD')],
                default='PKR',
                max_length=3,
            ),
        ),
        migrations.AddField(
            model_name='lead',
            name='expected_close_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='lead',
            name='lost_reason',
            field=models.CharField(
                blank=True,
                choices=[
                    ('price', 'Price'),
                    ('ghosted', 'Ghosted'),
                    ('competitor', 'Competitor'),
                    ('features', 'Features'),
                    ('timing', 'Timing'),
                ],
                max_length=20,
                null=True,
            ),
        ),
        migrations.RunPython(migrate_status_and_source, migrations.RunPython.noop),
        migrations.CreateModel(
            name='Note',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('note_type', models.CharField(
                    choices=[
                        ('call', 'Call'),
                        ('email', 'Email'),
                        ('whatsapp', 'WhatsApp'),
                        ('general', 'General'),
                    ],
                    default='general',
                    max_length=20,
                )),
                ('content', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('created_by', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='lead_notes',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('lead', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='note_records',
                    to='leads.lead',
                )),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.RunPython(migrate_activities_to_notes, migrations.RunPython.noop),
        migrations.DeleteModel(
            name='LeadActivity',
        ),
        migrations.RemoveField(
            model_name='lead',
            name='notes',
        ),
        migrations.AlterField(
            model_name='note',
            name='lead',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='notes',
                to='leads.lead',
            ),
        ),
        migrations.RunPython(set_assigned_to_owner, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='lead',
            name='source',
            field=models.CharField(
                choices=[
                    ('referral', 'Referral'),
                    ('fb_ads', 'FB Ads'),
                    ('linkedin', 'LinkedIn'),
                    ('cold_outreach', 'Cold Outreach'),
                    ('website', 'Website'),
                    ('whatsapp', 'WhatsApp'),
                ],
                default='website',
                max_length=50,
            ),
        ),
        migrations.AlterField(
            model_name='lead',
            name='status',
            field=models.CharField(
                choices=[
                    ('new_lead', 'New Lead'),
                    ('discovery_call', 'Discovery Call'),
                    ('proposal_sent', 'Proposal Sent'),
                    ('negotiation', 'Negotiation'),
                    ('won', 'Won'),
                    ('lost', 'Lost'),
                ],
                default='new_lead',
                max_length=20,
            ),
        ),
    ]
