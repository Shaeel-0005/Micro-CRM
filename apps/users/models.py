from django.db import models
from django.contrib.auth.models import User

# For now, we'll use Django's built-in User model
# Later you can extend it with a Profile model if needed

class UserProfile(models.Model):
    """Extended user profile (optional, for future use)"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True, null=True)
    company = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile for {self.user.username}"