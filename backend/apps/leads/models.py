from django.db import models
from django.contrib.auth.models import User


class Lead(models.Model):
    """Core lead/client model — Phase 1 agency pipeline."""

    STATUS_CHOICES = [
        ('new_lead', 'New Lead'),
        ('discovery_call', 'Discovery Call'),
        ('proposal_sent', 'Proposal Sent'),
        ('negotiation', 'Negotiation'),
        ('won', 'Won'),
        ('lost', 'Lost'),
    ]

    SOURCE_CHOICES = [
        ('referral', 'Referral'),
        ('fb_ads', 'FB Ads'),
        ('linkedin', 'LinkedIn'),
        ('cold_outreach', 'Cold Outreach'),
        ('website', 'Website'),
        ('whatsapp', 'WhatsApp'),
    ]

    LOST_REASON_CHOICES = [
        ('price', 'Price'),
        ('ghosted', 'Ghosted'),
        ('competitor', 'Competitor'),
        ('features', 'Features'),
        ('timing', 'Timing'),
    ]

    CURRENCY_CHOICES = [
        ('PKR', 'PKR'),
        ('USD', 'USD'),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leads')
    workspace = models.ForeignKey(
        'workspaces.Workspace',
        on_delete=models.CASCADE,
        related_name='leads',
        null=True,
        blank=True,
    )
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='assigned_leads',
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    company = models.CharField(max_length=100, blank=True, null=True)
    source = models.CharField(max_length=50, choices=SOURCE_CHOICES, default='website')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new_lead')
    deal_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    deal_currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='PKR')
    expected_close_date = models.DateField(null=True, blank=True)
    lost_reason = models.CharField(max_length=20, choices=LOST_REASON_CHOICES, blank=True, null=True)
    tags = models.ManyToManyField('LeadTag', blank=True, related_name='leads')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.status})"

    def save(self, *args, **kwargs):
        if self.assigned_to_id is None and self.owner_id:
            self.assigned_to_id = self.owner_id
        super().save(*args, **kwargs)


class Note(models.Model):
    """Activity timeline notes for a lead."""

    NOTE_TYPES = [
        ('call', 'Call'),
        ('email', 'Email'),
        ('whatsapp', 'WhatsApp'),
        ('general', 'General'),
    ]

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='notes')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lead_notes')
    note_type = models.CharField(max_length=20, choices=NOTE_TYPES, default='general')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.note_type} on {self.lead.name}"


class LeadTag(models.Model):
    workspace = models.ForeignKey(
        'workspaces.Workspace',
        on_delete=models.CASCADE,
        related_name='lead_tags',
    )
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=20, default='#FF7F40')

    class Meta:
        unique_together = [('workspace', 'name')]
        ordering = ['name']

    def __str__(self):
        return self.name


class SavedView(models.Model):
    workspace = models.ForeignKey(
        'workspaces.Workspace',
        on_delete=models.CASCADE,
        related_name='saved_views',
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_views')
    name = models.CharField(max_length=100)
    filters = models.JSONField(default=dict, blank=True)
    is_shared = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Proposal(models.Model):
    STATUS_CHOICES = [
        ('drafted', 'Drafted'),
        ('sent', 'Sent'),
        ('viewed', 'Viewed'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    workspace = models.ForeignKey(
        'workspaces.Workspace',
        on_delete=models.CASCADE,
        related_name='proposals',
    )
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='proposals')
    title = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='drafted')
    content = models.TextField(blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_proposals',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.status})"
