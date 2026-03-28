"""
apps/reminders/views.py
Day 9: ReminderViewSet with complete/upcoming/overdue/stats actions.
"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import Reminder
from .serializers import ReminderSerializer, ReminderListSerializer


class ReminderViewSet(viewsets.ModelViewSet):
    """
    list:     GET    /api/reminders/
    create:   POST   /api/reminders/
    retrieve: GET    /api/reminders/{id}/
    update:   PUT    /api/reminders/{id}/
    partial:  PATCH  /api/reminders/{id}/
    destroy:  DELETE /api/reminders/{id}/
    complete: POST   /api/reminders/{id}/complete/
    upcoming: GET    /api/reminders/upcoming/
    overdue:  GET    /api/reminders/overdue/
    stats:    GET    /api/reminders/stats/
    """

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reminder.objects.filter(owner=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return ReminderListSerializer
        return ReminderSerializer

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Toggle is_completed — POST /api/reminders/{id}/complete/"""
        reminder              = self.get_object()
        reminder.is_completed = not reminder.is_completed
        reminder.save()
        return Response(ReminderSerializer(reminder, context={'request': request}).data)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Next 5 incomplete reminders — used by Overview widget."""
        qs = (
            self.get_queryset()
            .filter(is_completed=False)
            .order_by('reminder_date')[:5]
        )
        return Response(ReminderListSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Incomplete reminders past their due date."""
        qs = (
            self.get_queryset()
            .filter(is_completed=False, reminder_date__lt=timezone.now())
            .order_by('reminder_date')
        )
        return Response(ReminderListSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Counts for sidebar badge and dashboard."""
        qs      = self.get_queryset()
        now     = timezone.now()
        pending = qs.filter(is_completed=False)
        return Response({
            'total':     qs.count(),
            'pending':   pending.count(),
            'overdue':   pending.filter(reminder_date__lt=now).count(),
            'upcoming':  pending.filter(reminder_date__gte=now).count(),
            'completed': qs.filter(is_completed=True).count(),
        })