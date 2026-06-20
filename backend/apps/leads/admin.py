from django.contrib import admin
from .models import Lead, Note, LeadTag, SavedView, Proposal


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'company', 'status', 'workspace', 'source',
        'deal_value', 'assigned_to', 'owner', 'created_at',
    )
    list_filter = ('status', 'source', 'workspace', 'lost_reason', 'deal_currency')
    search_fields = ('name', 'email', 'company', 'phone')


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('lead', 'note_type', 'created_by', 'created_at')
    list_filter = ('note_type', 'created_at')


@admin.register(LeadTag)
class LeadTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'workspace', 'color')


@admin.register(SavedView)
class SavedViewAdmin(admin.ModelAdmin):
    list_display = ('name', 'workspace', 'user', 'is_shared')


@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = ('title', 'lead', 'status', 'workspace', 'sent_at')