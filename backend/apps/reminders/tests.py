"""
apps/reminders/tests.py
Day 14: Test suite for Reminder CRUD, ownership, and custom actions.

Run with:
    python manage.py test apps.reminders.tests -v 2
"""

from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.leads.models import Lead
from .models import Reminder


# ─── Base ─────────────────────────────────────────────────────────────────────

class ReminderTestCase(APITestCase):

    def setUp(self):
        self.user_a = User.objects.create_user(username='user_a', password='TestPass123!')
        self.user_b = User.objects.create_user(username='user_b', password='TestPass123!')
        self.authenticate(self.user_a)

        # A lead owned by user_a for linking
        self.lead = Lead.objects.create(
            owner=self.user_a, name='Test Lead',
            status='new', source='other',
        )

        self.future = timezone.now() + timedelta(days=1)
        self.past   = timezone.now() - timedelta(hours=2)

        self.valid_payload = {
            'title':         'Follow up on proposal',
            'reminder_date': self.future.isoformat(),
            'lead':          self.lead.pk,
        }

    def authenticate(self, user):
        token = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')

    def create_reminder(self, user=None, **kwargs):
        owner = user or self.user_a
        defaults = {
            'owner':         owner,
            'title':         'Default reminder',
            'reminder_date': self.future,
        }
        defaults.update(kwargs)
        return Reminder.objects.create(**defaults)


# ─── CRUD ─────────────────────────────────────────────────────────────────────

class ReminderCreateTests(ReminderTestCase):

    def test_create_reminder_success(self):
        url      = reverse('reminder-list')
        response = self.client.post(url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], self.valid_payload['title'])

    def test_create_sets_owner(self):
        url = reverse('reminder-list')
        self.client.post(url, self.valid_payload, format='json')
        self.assertEqual(Reminder.objects.first().owner, self.user_a)

    def test_create_requires_title(self):
        url     = reverse('reminder-list')
        payload = {**self.valid_payload, 'title': ''}
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)

    def test_create_requires_future_date(self):
        url     = reverse('reminder-list')
        payload = {**self.valid_payload, 'reminder_date': self.past.isoformat()}
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('reminder_date', response.data)

    def test_create_without_lead_allowed(self):
        """Lead is optional."""
        url     = reverse('reminder-list')
        payload = {'title': 'General reminder', 'reminder_date': self.future.isoformat()}
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_unauthenticated_rejected(self):
        self.client.credentials()
        url      = reverse('reminder-list')
        response = self.client.post(url, self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ReminderReadTests(ReminderTestCase):

    def test_list_reminders(self):
        self.create_reminder(title='R1')
        self.create_reminder(title='R2', reminder_date=self.future + timedelta(hours=1))
        url      = reverse('reminder-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results  = response.data if isinstance(response.data, list) else response.data.get('results', [])
        self.assertEqual(len(results), 2)

    def test_retrieve_reminder(self):
        r        = self.create_reminder(title='Single')
        url      = reverse('reminder-detail', kwargs={'pk': r.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Single')


class ReminderUpdateTests(ReminderTestCase):

    def test_partial_update_title(self):
        r        = self.create_reminder()
        url      = reverse('reminder-detail', kwargs={'pk': r.pk})
        response = self.client.patch(url, {'title': 'Updated title'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        r.refresh_from_db()
        self.assertEqual(r.title, 'Updated title')


class ReminderDeleteTests(ReminderTestCase):

    def test_delete_reminder(self):
        r        = self.create_reminder()
        url      = reverse('reminder-detail', kwargs={'pk': r.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Reminder.objects.count(), 0)


# ─── Ownership ────────────────────────────────────────────────────────────────

class ReminderOwnershipTests(ReminderTestCase):

    def test_user_cannot_see_other_users_reminders(self):
        self.create_reminder(user=self.user_a, title='A reminder')
        self.create_reminder(user=self.user_b, title='B reminder')
        url     = reverse('reminder-list')
        response = self.client.get(url)
        results  = response.data if isinstance(response.data, list) else response.data.get('results', [])
        titles   = [r['title'] for r in results]
        self.assertIn('A reminder', titles)
        self.assertNotIn('B reminder', titles)

    def test_user_cannot_retrieve_other_users_reminder(self):
        r_b      = self.create_reminder(user=self.user_b)
        url      = reverse('reminder-detail', kwargs={'pk': r_b.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_cannot_delete_other_users_reminder(self):
        r_b      = self.create_reminder(user=self.user_b)
        url      = reverse('reminder-detail', kwargs={'pk': r_b.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Reminder.objects.filter(pk=r_b.pk).exists())


# ─── Custom actions ───────────────────────────────────────────────────────────

class ReminderActionTests(ReminderTestCase):

    def test_complete_toggles_is_completed(self):
        r        = self.create_reminder()
        self.assertFalse(r.is_completed)
        url      = reverse('reminder-complete', kwargs={'pk': r.pk})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        r.refresh_from_db()
        self.assertTrue(r.is_completed)

    def test_complete_toggles_back(self):
        """Calling complete twice returns to incomplete."""
        r   = self.create_reminder()
        url = reverse('reminder-complete', kwargs={'pk': r.pk})
        self.client.post(url)
        self.client.post(url)
        r.refresh_from_db()
        self.assertFalse(r.is_completed)

    def test_upcoming_returns_only_incomplete(self):
        self.create_reminder(title='Future',    reminder_date=self.future)
        done = self.create_reminder(title='Done', reminder_date=self.future + timedelta(hours=1))
        done.is_completed = True
        done.save()

        url      = reverse('reminder-upcoming')
        response = self.client.get(url)
        results  = response.data if isinstance(response.data, list) else response.data.get('results', [])
        titles   = [r['title'] for r in results]
        self.assertIn('Future', titles)
        self.assertNotIn('Done', titles)

    def test_overdue_returns_past_incomplete(self):
        self.create_reminder(title='Overdue', reminder_date=self.past)
        self.create_reminder(title='Future',  reminder_date=self.future)

        url      = reverse('reminder-overdue')
        response = self.client.get(url)
        results  = response.data if isinstance(response.data, list) else response.data.get('results', [])
        titles   = [r['title'] for r in results]
        self.assertIn('Overdue', titles)
        self.assertNotIn('Future', titles)

    def test_stats_returns_correct_counts(self):
        self.create_reminder(title='P1', reminder_date=self.future)
        self.create_reminder(title='P2', reminder_date=self.future + timedelta(hours=2))
        done = self.create_reminder(title='Done', reminder_date=self.future + timedelta(hours=3))
        done.is_completed = True; done.save()

        url      = reverse('reminder-stats')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total'],     3)
        self.assertEqual(response.data['pending'],   2)
        self.assertEqual(response.data['completed'], 1)

    def test_is_overdue_field_accurate(self):
        r        = self.create_reminder(reminder_date=self.past)
        url      = reverse('reminder-detail', kwargs={'pk': r.pk})
        response = self.client.get(url)
        self.assertTrue(response.data['is_overdue'])

    def test_future_reminder_not_overdue(self):
        r        = self.create_reminder(reminder_date=self.future)
        url      = reverse('reminder-detail', kwargs={'pk': r.pk})
        response = self.client.get(url)
        self.assertFalse(response.data['is_overdue'])