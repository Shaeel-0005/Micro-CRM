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
    def test_patch_status_new_lead_to_discovery_call(self):
        lead = self.create_lead()
        response = self.client.patch(
            reverse('lead-detail', kwargs={'pk': lead.pk}),
            {'status': 'discovery_call'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'discovery_call')
        lead.refresh_from_db()
        self.assertEqual(lead.status, 'discovery_call')

    def test_patch_lost_to_discovery_clears_lost_reason(self):
        lead = self.create_lead(status='lost', lost_reason='price')
        response = self.client.patch(
            reverse('lead-detail', kwargs={'pk': lead.pk}),
            {'status': 'discovery_call'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lead.refresh_from_db()
        self.assertEqual(lead.status, 'discovery_call')
        self.assertIsNone(lead.lost_reason)

    def test_lost_status_requires_lost_reason(self):
        lead = self.create_lead()
        response = self.client.patch(
            reverse('lead-detail', kwargs={'pk': lead.pk}),
            {'status': 'lost'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LeadRoleMatrixTests(LeadTestCase):
    def setUp(self):
        super().setUp()
        self.user_mgr = User.objects.create_user(
            username='user_mgr', email='mgr@test.com', password='TestPass123!'
        )
        WorkspaceMembership.objects.create(
            workspace=self.workspace,
            user=self.user_mgr,
            role=WorkspaceMembership.ROLE_MANAGER,
        )
        WorkspaceMembership.objects.create(
            workspace=self.workspace,
            user=self.user_b,
            role=WorkspaceMembership.ROLE_MEMBER,
        )
        self.lead_unassigned = self.create_lead(
            user=self.user_a, assigned_to=self.user_a,
            name='Unassigned to B', email='unassigned@example.com',
        )
        self.lead_for_b = self.create_lead(
            user=self.user_b, assigned_to=self.user_b,
            name='Lead B', email='b@example.com',
        )

    def test_manager_can_patch_any_workspace_lead(self):
        self.authenticate(self.user_mgr)
        response = self.client.patch(
            reverse('lead-detail', kwargs={'pk': self.lead_unassigned.pk}),
            {'status': 'negotiation'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_member_can_patch_assigned_lead(self):
        self.authenticate(self.user_b)
        response = self.client.patch(
            reverse('lead-detail', kwargs={'pk': self.lead_for_b.pk}),
            {'status': 'discovery_call'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_member_cannot_patch_unassigned_lead(self):
        self.authenticate(self.user_b)
        response = self.client.patch(
            reverse('lead-detail', kwargs={'pk': self.lead_unassigned.pk}),
            {'status': 'discovery_call'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_can_export_csv(self):
        response = self.client.get(reverse('lead-export-csv'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')

    def test_member_cannot_export_csv(self):
        self.authenticate(self.user_b)
        response = self.client.get(reverse('lead-export-csv'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_member_cannot_view_audit_log(self):
        self.authenticate(self.user_b)
        response = self.client.get(reverse('workspace-audit-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_can_view_audit_log(self):
        self.authenticate(self.user_mgr)
        response = self.client.get(reverse('workspace-audit-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class Phase1RegressionTests(LeadTestCase):
    """Phase 1 endpoints must stay healthy through Phase 2."""

    def test_notes_create_list_delete(self):
        lead = self.create_lead()
        create_resp = self.client.post(
            reverse('lead-note-list', kwargs={'lead_pk': lead.pk}),
            {'note_type': 'call', 'content': 'Follow-up call completed'},
            format='json',
        )
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        note_id = create_resp.data['id']

        list_resp = self.client.get(reverse('lead-note-list', kwargs={'lead_pk': lead.pk}))
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        items = list_resp.data if isinstance(list_resp.data, list) else list_resp.data.get('results', [])
        self.assertTrue(any(n['id'] == note_id for n in items))

        del_resp = self.client.delete(
            reverse('lead-note-detail', kwargs={'lead_pk': lead.pk, 'pk': note_id}),
        )
        self.assertEqual(del_resp.status_code, status.HTTP_204_NO_CONTENT)

    def test_money_stats_endpoint(self):
        self.create_lead(deal_value='10000.00', deal_currency='PKR')
        response = self.client.get(reverse('lead-money-stats'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('pipeline_value', response.data)
        self.assertIn('overdue_follow_ups', response.data)
        self.assertIn('lost_reasons', response.data)

    def test_lead_stats_endpoint(self):
        self.create_lead()
        response = self.client.get(reverse('lead-stats'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('by_status', response.data)


class InviteFlowTests(LeadTestCase):
    def test_admin_create_invite_and_accept(self):
        invite_resp = self.client.post(
            reverse('workspace-invites'),
            {'email': 'newmember@test.com', 'role': 'member'},
            format='json',
        )
        self.assertEqual(invite_resp.status_code, status.HTTP_201_CREATED)
        token = invite_resp.data['token']

        new_user = User.objects.create_user(
            username='newmember', email='newmember@test.com', password='TestPass123!'
        )
        self.authenticate(new_user)
        accept_resp = self.client.post(
            reverse('workspace-invite-accept'),
            {'token': str(token)},
            format='json',
        )
        self.assertEqual(accept_resp.status_code, status.HTTP_200_OK)
        membership = WorkspaceMembership.objects.get(user=new_user, workspace=self.workspace)
        self.assertEqual(membership.role, WorkspaceMembership.ROLE_MEMBER)


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
