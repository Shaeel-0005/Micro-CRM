"""
apps/reminders/tasks.py
Day 17: Celery tasks for reminder notifications.
Currently logs due reminders — extend with email/WhatsApp later.
"""

from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings


@shared_task
def check_due_reminders():
    """
    Runs every minute via Celery Beat.
    Finds reminders due in the next 5 minutes and logs them.
    Extend this to send email/WhatsApp notifications.
    """
    from .models import Reminder

    now    = timezone.now()
    window = now + timezone.timedelta(minutes=5)

    due = Reminder.objects.filter(
        is_completed=False,
        reminder_date__gte=now,
        reminder_date__lte=window,
    ).select_related('owner', 'lead')

    for reminder in due:
        print(
            f'[REMINDER DUE] {reminder.title} '
            f'— User: {reminder.owner.username} '
            f'— Due: {reminder.reminder_date}'
        )
        # TODO: send email notification here
        # TODO: send WhatsApp via Twilio (Phase 4)

    return f'Checked {due.count()} due reminders'


@shared_task
def send_reminder_email(reminder_id):
    """
    Send an email notification for a specific reminder.
    Called manually or triggered by check_due_reminders.
    Requires EMAIL_* settings in production.
    """
    from .models import Reminder

    try:
        reminder = Reminder.objects.select_related('owner', 'lead').get(
            pk=reminder_id,
            is_completed=False,
        )
    except Reminder.DoesNotExist:
        return 'Reminder not found or already completed'

    subject = f'LeadFlow Reminder: {reminder.title}'
    message = (
        f'Hi {reminder.owner.username},\n\n'
        f'You have a reminder due:\n\n'
        f'  {reminder.title}\n'
        f'  Due: {reminder.reminder_date.strftime("%B %d, %Y at %I:%M %p UTC")}\n'
    )
    if reminder.lead:
        message += f'  Lead: {reminder.lead.name}\n'
    if reminder.message:
        message += f'\nNotes: {reminder.message}\n'

    message += '\n— LeadFlow'

    if reminder.owner.email:
        send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@leadflow.app'),
            recipient_list=[reminder.owner.email],
            fail_silently=True,
        )
        return f'Email sent to {reminder.owner.email}'

    return 'No email address on file'
