"""
leadflow/celery.py
Day 17: Celery application — async task worker.
"""

import os
from celery import Celery

# Default to development settings
os.environ.setdefault(
    'DJANGO_SETTINGS_MODULE',
    'leadflow.settings.development'
)

app = Celery('leadflow')

# Read config from Django settings, namespace CELERY_
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all installed apps
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')