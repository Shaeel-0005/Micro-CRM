"""
leadflow/settings/base.py
Shared settings — imported by development.py and production.py
"""

import os
from pathlib import Path
from datetime import timedelta
from celery.schedules import crontab

BASE_DIR = Path(__file__).resolve().parent.parent.parent
from dotenv import load_dotenv
load_dotenv(BASE_DIR / '.env')
# ── Security ──────────────────────────────────────────────────────────────────
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-insecure-key')
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost').split(',')

# ── Apps ──────────────────────────────────────────────────────────────────────
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
]

LOCAL_APPS = [
    'apps.users',
    'apps.workspaces',
    'apps.leads',
    'apps.reminders',
    'apps.analytics',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ── Middleware ────────────────────────────────────────────────────────────────
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',              # must be first
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'leadflow.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'leadflow.wsgi.application'

# ── Database ──────────────────────────────────────────────────────────────────
# Parsed from DATABASE_URL env var
import dj_database_url  # added to requirements below

DATABASE_URL = os.environ.get(
    'DATABASE_URL',
    'postgresql://postgres:postgres@localhost:5432/micro_crm_db'
)
DATABASES = {
    'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)
}

# ── Password validation ───────────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ── i18n ──────────────────────────────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE     = 'UTC'
USE_I18N      = True
USE_TZ        = True

# ── Static files ─────────────────────────────────────────────────────────────
STATIC_URL  = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── REST Framework ────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

# ── JWT ───────────────────────────────────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS':  True,
}

# ── Celery ────────────────────────────────────────────────────────────────────
CELERY_BROKER_URL         = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND     = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT     = ['json']
CELERY_TASK_SERIALIZER    = 'json'
CELERY_RESULT_SERIALIZER  = 'json'
CELERY_TIMEZONE           = 'UTC'

CELERY_BEAT_SCHEDULE = {
    # Check for due reminders every minute
    'check-due-reminders': {
        'task':     'apps.reminders.tasks.check_due_reminders',
        'schedule': 60.0,  # every 60 seconds
    },
}
