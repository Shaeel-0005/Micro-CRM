

"""
backend/leadflow/urls.py
Update this file to include leads API routes
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health(request):
    return JsonResponse({"status": "ok"})
  
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health),
    
    # Auth endpoints (from Day 3)
    path('api/auth/', include('apps.users.urls')),
    
    # Leads API endpoints (Day 4)
    path('api/leads/', include('apps.leads.urls')),
    # Reminders API endpoints (Day 9)
    path('api/reminders/', include('apps.reminders.urls')),
    
    path('api/analytics/', include('apps.analytics.urls')),
    
  path('api/users/', include('apps.users.urls')),
]