from django.db import models
from apps.leads.models import Lead


class Reminder(models.Model):
    """Follow-up reminders for leads"""
    
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='reminders')
    reminder_date = models.DateTimeField()
    message = models.TextField()
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['reminder_date']

    def __str__(self):
        return f"Reminder for {self.lead.name} on {self.reminder_date}"