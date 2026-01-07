from django.contrib import admin
from .models import Reminder


@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = ('lead', 'reminder_date', 'is_completed', 'created_at')
    list_filter = ('is_completed', 'reminder_date')
    search_fields = ('lead__name', 'message')