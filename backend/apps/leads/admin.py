from django.contrib import admin
from .models import Lead, Note


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'company',
        'status',
        'source',
        'deal_value',
        'deal_currency',
        'expected_close_date',
        'lost_reason',
        'owner',
        'assigned_to',
        'created_at',
    )
    list_filter = ('status', 'source', 'lost_reason', 'deal_currency', 'created_at')
    search_fields = ('name', 'email', 'company', 'phone')


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('lead', 'note_type', 'created_by', 'created_at')
    list_filter = ('note_type', 'created_at')
    search_fields = ('lead__name', 'content', 'created_by__username')