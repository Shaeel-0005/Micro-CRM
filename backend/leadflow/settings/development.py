"""
leadflow/settings/development.py
Local development settings — debug on, relaxed CORS.
"""

from .base import *

DEBUG = True

CORS_ALLOW_ALL_ORIGINS = True   # relaxed for local dev

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