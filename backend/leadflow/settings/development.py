"""
leadflow/settings/development.py
Local development settings — debug on, relaxed CORS.
"""

import os
from pathlib import Path

from .base import *

DEBUG = True

CORS_ALLOW_ALL_ORIGINS = True   # relaxed for local dev

# Local dev without Docker: use SQLite unless DATABASE_URL is explicitly set.
# Set DATABASE_URL in the environment to use Postgres (e.g. via docker-compose).
if not os.environ.get('DATABASE_URL'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': Path(__file__).resolve().parent.parent.parent / 'db.sqlite3',
        }
    }

# Django debug toolbar (optional — install separately)
# INSTALLED_APPS += ['debug_toolbar']

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}