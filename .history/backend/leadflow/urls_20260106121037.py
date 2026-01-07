"""
backend/leadflow/urls.py
Update this file to include leads API routes
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth endpoints (from Day 3)
    path('api/auth/', include('apps.users.urls')),
    
    # Leads API endpoints (Day 4)
    path('api/leads/', include('apps.leads.urls')),
]