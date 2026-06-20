"""
apps/leads/tests.py — Phase 1 + Phase 2 workspace permission tests.
"""

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.workspaces.models import WorkspaceMembership
from apps.workspaces.services import create_workspace_for_user
from .models import Lead


class LeadTestCase(APITestCase):
    def setUp(self):
        self.user_a = User.objects.create_user(
            username='user_a', email='usera@test.com', password='TestPass123!'
        )
        self.user_b = User.objects.create_user(
            username='user_b', email='userb@test.com', password='TestPass123!'
        )
        self.membership_a = create_workspace_for_user(self.user_a)
        self.workspace = self.membership_a.workspace
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
        membership = WorkspaceMembership.objects.get(user=user, workspace=self.workspace)
        payload = {
            'owner': user,
            'workspace': self.workspace,
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

    def test_create_lead_sets_workspace(self):
        self.client.post(reverse('lead-list'), self.valid_payload, format='json')
        lead = Lead.objects.first()
        self.assertEqual(lead.workspace, self.workspace)


class LeadWorkspacePermissionTests(LeadTestCase):
    def setUp(self):
        super().setUp()
        self.membership_b = WorkspaceMembership.objects.create(
            workspace=self.workspace,
            user=self.user_b,
            role=WorkspaceMembership.ROLE_MEMBER,
        )
        self.lead_a = self.create_lead(user=self.user_a, name='Lead A', email='a@example.com')
        self.lead_b = self.create_lead(
            user=self.user_b, assigned_to=self.user_b,
            name='Lead B', email='b@example.com',
        )

    def test_admin_sees_all_workspace_leads(self):
        response = self.client.get(reverse('lead-list'))
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])
        names = [r['name'] for r in results]
        self.assertIn('Lead A', names)
        self.assertIn('Lead B', names)

    def test_member_sees_only_assigned_leads(self):
        self.authenticate(self.user_b)
        response = self.client.get(reverse('lead-list'))
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])
        names = [r['name'] for r in results]
        self.assertNotIn('Lead A', names)
        self.assertIn('Lead B', names)

    def test_member_cannot_access_unassigned_lead(self):
        self.authenticate(self.user_b)
        response = self.client.get(reverse('lead-detail', kwargs={'pk': self.lead_a.pk}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class LeadUpdateTests(LeadTestCase):
    def test_lost_status_requires_lost_reason(self):
        lead = self.create_lead()
        response = self.client.patch(
            reverse('lead-detail', kwargs={'pk': lead.pk}),
            {'status': 'lost'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class WorkspaceApiTests(LeadTestCase):
    def test_workspace_me_endpoint(self):
        response = self.client.get(reverse('workspace-me'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], WorkspaceMembership.ROLE_ADMIN)
        self.assertTrue(response.data['permissions']['can_manage_team'])

    def test_list_workspace_members(self):
        response = self.client.get(reverse('workspace-member-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
