from django.contrib import admin
from .models import Lead, LeadActivity


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'company', 'status', 'source', 'owner', 'created_at')
    list_filter = ('status', 'source', 'created_at')
    search_fields = ('name', 'email', 'company')


@admin.register(LeadActivity)
class LeadActivityAdmin(admin.ModelAdmin):
    list_display = ('lead', 'activity_type', 'created_at')
    list_filter = ('activity_type', 'created_at')
    search_fields = ('lead__name', 'description')