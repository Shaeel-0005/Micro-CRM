"""
apps/reminders/models.py
Day 9: Added title field. message is now optional notes.
Run: python manage.py makemigrations && python manage.py migrate
"""

from django.db import models
from django.contrib.auth.models import User
from apps.leads.models import Lead


class Reminder(models.Model):
    """Follow-up reminders linked to a lead and owned by a user."""

    owner         = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reminders')
    lead          = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='reminders', null=True, blank=True)
    title         = models.CharField(max_length=200)
    message       = models.TextField(blank=True, null=True)   # optional extra notes
    reminder_date = models.DateTimeField()
    is_completed  = models.BooleanField(default=False)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['reminder_date']

    def __str__(self):
        return f"{self.title} — {self.reminder_date:%Y-%m-%d %H:%M}"