"""
apps/analytics/views.py
Day 12: Pandas-based analytics endpoint.
Exposes aggregated metrics for the Reports page.

Install pandas if not already:
    pip install pandas --break-system-packages
"""

from datetime import timedelta
from decimal import Decimal

from django.db.models import Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False

from apps.leads.models import Lead
from apps.reminders.models import Reminder
from apps.workspaces.services import leads_queryset_for_user

OPEN_STATUSES = ['new_lead', 'discovery_call', 'proposal_sent', 'negotiation']


def _money_metrics(leads):
  open_deals = leads.exclude(status__in=['won', 'lost'])
  pkr_total = open_deals.filter(deal_currency='PKR').aggregate(
    total=Coalesce(Sum('deal_value'), Decimal('0'))
  )['total']
  usd_total = open_deals.filter(deal_currency='USD').aggregate(
    total=Coalesce(Sum('deal_value'), Decimal('0'))
  )['total']

  now = timezone.now()
  month_start = now.date().replace(day=1)
  next_month = (month_start + timedelta(days=32)).replace(day=1)

  lost_reasons = {
    key: leads.filter(status='lost', lost_reason=key).count()
    for key, _label in Lead.LOST_REASON_CHOICES
  }

  return {
    'pipeline_value': {'PKR': str(pkr_total), 'USD': str(usd_total)},
    'deals_closing_this_month': leads.filter(
      expected_close_date__gte=month_start,
      expected_close_date__lt=next_month,
    ).count(),
    'lost_reasons': lost_reasons,
  }


class AnalyticsDashboardView(APIView):
    """
    GET /api/analytics/dashboard/
    Returns rich metrics for the Reports page.
    Falls back to pure Django ORM if pandas isn't installed.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        leads = leads_queryset_for_user(request.user)

        if PANDAS_AVAILABLE and leads.exists():
            return self._pandas_response(leads, request.user)
        return self._orm_response(leads, request.user)

    def _pandas_response(self, leads, user):
        """Rich analytics using Pandas."""
        # Build DataFrame
        data = list(leads.values(
            'id', 'status', 'source', 'created_at', 'updated_at'
        ))
        df = pd.DataFrame(data)
        df['created_at'] = pd.to_datetime(df['created_at'], utc=True)

        now   = pd.Timestamp.now(tz='UTC')
        total = len(df)

        # ── Status breakdown ─────────────────────────────────────────────────
        status_counts = df['status'].value_counts().to_dict()
        by_status = {
            s: status_counts.get(s, 0)
            for s in ['new_lead', 'discovery_call', 'proposal_sent', 'negotiation', 'won', 'lost']
        }

        # ── Source breakdown ──────────────────────────────────────────────────
        by_source = df['source'].value_counts().to_dict()

        # ── Win / loss rates ──────────────────────────────────────────────────
        won    = by_status.get('won', 0)
        lost   = by_status.get('lost', 0)
        closed = won + lost
        win_rate     = round((won / closed * 100), 1) if closed > 0 else 0
        conv_rate    = round((won / total * 100), 1)  if total > 0 else 0

        # ── Monthly trends (last 6 months) ────────────────────────────────────
        df['month'] = df['created_at'].dt.to_period('M').astype(str)
        monthly_new = (
            df.groupby('month')
            .size()
            .reset_index(name='count')
            .tail(6)
            .to_dict(orient='records')
        )

        won_df = df[df['status'] == 'won'].copy()
        if not won_df.empty:
            monthly_won = (
                won_df.groupby('month')
                .size()
                .reset_index(name='count')
                .tail(6)
                .to_dict(orient='records')
            )
        else:
            monthly_won = []

        # ── Recent 30 days vs previous 30 days ────────────────────────────────
        last_30  = df[df['created_at'] >= now - pd.Timedelta(days=30)]
        prev_30  = df[
            (df['created_at'] >= now - pd.Timedelta(days=60)) &
            (df['created_at'] <  now - pd.Timedelta(days=30))
        ]
        trend_pct = 0
        if len(prev_30) > 0:
            trend_pct = round(((len(last_30) - len(prev_30)) / len(prev_30)) * 100, 1)

        money = _money_metrics(leads)
        overdue_follow_ups = Reminder.objects.filter(
            owner=user,
            is_completed=False,
            reminder_date__lt=now.to_pydatetime(),
        ).count()

        return Response({
            'total':          total,
            'by_status':      by_status,
            'by_source':      by_source,
            'win_rate':       win_rate,
            'conversion_rate': conv_rate,
            'monthly_new':    monthly_new,
            'monthly_won':    monthly_won,
            'trend_pct':      trend_pct,
            'last_30_days':   len(last_30),
            'overdue_follow_ups': overdue_follow_ups,
            **money,
        })

    def _orm_response(self, leads, user):
        """Fallback — pure Django ORM when Pandas isn't available."""
        from django.db.models import Count

        total      = leads.count()
        by_status  = {
            s: leads.filter(status=s).count()
            for s in ['new_lead', 'discovery_call', 'proposal_sent', 'negotiation', 'won', 'lost']
        }
        by_source  = {
            item['source']: item['count']
            for item in leads.values('source').annotate(count=Count('id'))
        }
        won    = by_status.get('won', 0)
        lost   = by_status.get('lost', 0)
        closed = won + lost

        money = _money_metrics(leads)
        overdue_follow_ups = Reminder.objects.filter(
            owner=user,
            is_completed=False,
            reminder_date__lt=timezone.now(),
        ).count()

        return Response({
            'total':           total,
            'by_status':       by_status,
            'by_source':       by_source,
            'win_rate':        round((won / closed * 100), 1) if closed > 0 else 0,
            'conversion_rate': round((won / total * 100), 1)  if total > 0 else 0,
            'monthly_new':     [],
            'monthly_won':     [],
            'trend_pct':       0,
            'last_30_days':    0,
            'overdue_follow_ups': overdue_follow_ups,
            **money,
        })