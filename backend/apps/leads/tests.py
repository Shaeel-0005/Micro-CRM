"""
apps/leads/tests.py — Phase 1 test suite for Lead CRUD, validation, ownership, notes.
"""

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Lead, Note


class LeadTestCase(APITestCase):
    def setUp(self):
        self.user_a = User.objects.create_user(
            username='user_a', email='usera@test.com', password='TestPass123!'
        )
        self.user_b = User.objects.create_user(
            username='user_b', email='userb@test.com', password='TestPass123!'
        )
        self.authenticate(self.user_a)
        self.valid_payload = {
            'name': 'Jane Smith',
            'email': 'jane@example.com',
            'phone': '+1234567890',
            'company': 'Acme Corp',
            'status': 'new_lead',
            'source': 'linkedin',
            'deal_value': '50000.00',
            'deal_currency': 'PKR',
        }

    def authenticate(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def create_lead(self, user=None, **kwargs):
        if user is None:
            user = self.user_a
        payload = {
            'owner': user,
            'assigned_to': user,
            'name': 'Default Lead',
            'email': 'default@example.com',
            'phone': '+1234567890',
            'company': 'Default Co',
            'status': 'new_lead',
            'source': 'website',
        }
        payload.update(kwargs)
        return Lead.objects.create(**payload)


class LeadCreateTests(LeadTestCase):
    def test_create_lead_success(self):
        response = self.client.post(reverse('lead-list'), self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], self.valid_payload['name'])

    def test_create_lead_sets_owner_and_assigned_to(self):
        self.client.post(reverse('lead-list'), self.valid_payload, format='json')
        lead = Lead.objects.first()
        self.assertEqual(lead.owner, self.user_a)
        self.assertEqual(lead.assigned_to, self.user_a)

    def test_create_lost_requires_lost_reason(self):
        payload = {**self.valid_payload, 'email': 'lost@example.com', 'status': 'lost'}
        response = self.client.post(reverse('lead-list'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('lost_reason', response.data)


class LeadUpdateTests(LeadTestCase):
    def test_partial_update_status(self):
        lead = self.create_lead()
        response = self.client.patch(
            reverse('lead-detail', kwargs={'pk': lead.pk}),
            {'status': 'discovery_call'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lead.refresh_from_db()
        self.assertEqual(lead.status, 'discovery_call')

    def test_lost_status_requires_lost_reason(self):
        lead = self.create_lead()
        response = self.client.patch(
            reverse('lead-detail', kwargs={'pk': lead.pk}),
            {'status': 'lost'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('lost_reason', response.data)

    def test_lost_status_with_reason_succeeds(self):
        lead = self.create_lead()
        response = self.client.patch(
            reverse('lead-detail', kwargs={'pk': lead.pk}),
            {'status': 'lost', 'lost_reason': 'ghosted'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lead.refresh_from_db()
        self.assertEqual(lead.lost_reason, 'ghosted')


class LeadFilteringTests(LeadTestCase):
    def setUp(self):
        super().setUp()
        self.create_lead(name='New LinkedIn', status='new_lead', source='linkedin', email='nl@example.com')
        self.create_lead(name='Won Referral', status='won', source='referral', email='wr@example.com')
        self.create_lead(name='Lost Price', status='lost', source='linkedin', email='ll@example.com', lost_reason='price')
        self.create_lead(name='Proposal Website', status='proposal_sent', source='website', email='pw@example.com')

    def test_filter_by_status_new_lead(self):
        response = self.client.get(reverse('lead-list'), {'status': 'new_lead'})
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], 'New LinkedIn')

    def test_filter_by_lost_reason(self):
        response = self.client.get(reverse('lead-list'), {'lost_reason': 'price'})
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], 'Lost Price')


class NoteTests(LeadTestCase):
    def test_create_note_on_lead(self):
        lead = self.create_lead()
        url = reverse('lead-note-list', kwargs={'lead_pk': lead.pk})
        response = self.client.post(url, {'note_type': 'whatsapp', 'content': 'Sent follow-up'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Note.objects.count(), 1)
        self.assertEqual(Note.objects.first().created_by, self.user_a)

    def test_user_cannot_access_other_users_notes(self):
        lead_b = self.create_lead(user=self.user_b, email='b@example.com')
        url = reverse('lead-note-list', kwargs={'lead_pk': lead_b.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class LeadMoneyStatsTests(LeadTestCase):
    def test_money_stats_endpoint(self):
        self.create_lead(deal_value='100000', deal_currency='PKR', status='proposal_sent', email='deal@example.com')
        response = self.client.get(reverse('lead-money-stats'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('pipeline_value', response.data)
        self.assertIn('lost_reasons', response.data)
        self.assertIn(response.data['pipeline_value']['PKR'], ('100000', '100000.00'))
