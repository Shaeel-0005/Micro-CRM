"""
apps/leads/tests.py
Day 6: Test suite for Lead CRUD, validation, ownership, and filtering.

Run with:
    python manage.py test apps.leads
"""

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Lead


# ─── Base test case ───────────────────────────────────────────────────────────

class LeadTestCase(APITestCase):
    """
    Base class — creates two users and authenticates as user_a by default.
    Inherit this instead of APITestCase to avoid repeating setup.
    """

    def setUp(self):
        # Two separate users to test ownership isolation
        self.user_a = User.objects.create_user(
            username='user_a',
            email='usera@test.com',
            password='TestPass123!'
        )
        self.user_b = User.objects.create_user(
            username='user_b',
            email='userb@test.com',
            password='TestPass123!'
        )

        # Authenticate as user_a by default
        self.authenticate(self.user_a)

        # Reusable valid lead payload
        self.valid_payload = {
            'name':    'Jane Smith',
            'email':   'jane@example.com',
            'phone':   '+1234567890',
            'company': 'Acme Corp',
            'status':  'new',
            'source':  'linkedin',
            'notes':   'Met at conference',
        }

    def authenticate(self, user):
        """Attach a JWT token for the given user to the test client."""
        refresh = RefreshToken.for_user(user)
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}'
        )

    def create_lead(self, user=None, **kwargs):
        """
        Helper to create a Lead directly in the DB (bypassing the API).
        Useful for setting up state before testing read/update/delete.
        """
        if user is None:
            user = self.user_a
        payload = {
            'owner':   user,
            'name':    'Default Lead',
            'email':   'default@example.com',
            'phone':   '+1234567890',
            'company': 'Default Co',
            'status':  'new',
            'source':  'other',
        }
        payload.update(kwargs)
        return Lead.objects.create(**payload)


# ─── 1. CRUD Tests ────────────────────────────────────────────────────────────

class LeadCreateTests(LeadTestCase):
    """POST /api/leads/"""

    def test_create_lead_success(self):
        """Authenticated user can create a lead with valid data."""
        url      = reverse('lead-list')
        response = self.client.post(url, self.valid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], self.valid_payload['name'])
        self.assertEqual(Lead.objects.count(), 1)

    def test_create_lead_sets_owner(self):
        """Created lead is automatically owned by the authenticated user."""
        url = reverse('lead-list')
        self.client.post(url, self.valid_payload, format='json')

        lead = Lead.objects.first()
        self.assertEqual(lead.owner, self.user_a)

    def test_create_lead_requires_name(self):
        """Name is required — missing it should return 400."""
        url     = reverse('lead-list')
        payload = {**self.valid_payload, 'name': ''}
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data)

    def test_create_lead_unauthenticated(self):
        """Unauthenticated requests are rejected with 401."""
        self.client.credentials()  # clear auth
        url      = reverse('lead-list')
        response = self.client.post(url, self.valid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class LeadReadTests(LeadTestCase):
    """GET /api/leads/ and GET /api/leads/{id}/"""

    def test_list_leads(self):
        """User sees their own leads in the list."""
        self.create_lead(name='Lead One')
        self.create_lead(name='Lead Two')

        url      = reverse('lead-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Handle both paginated and non-paginated responses
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])
        self.assertEqual(len(results), 2)

    def test_retrieve_single_lead(self):
        """User can retrieve a single lead by ID."""
        lead     = self.create_lead(name='Single Lead')
        url      = reverse('lead-detail', kwargs={'pk': lead.pk})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Single Lead')

    def test_retrieve_nonexistent_lead(self):
        """Requesting a lead that doesn't exist returns 404."""
        url      = reverse('lead-detail', kwargs={'pk': 99999})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class LeadUpdateTests(LeadTestCase):
    """PUT /api/leads/{id}/ and PATCH /api/leads/{id}/"""

    def test_full_update_lead(self):
        """PUT replaces all lead fields."""
        lead = self.create_lead()
        url  = reverse('lead-detail', kwargs={'pk': lead.pk})

        updated = {**self.valid_payload, 'name': 'Updated Name', 'email': 'updated@example.com'}
        response = self.client.put(url, updated, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lead.refresh_from_db()
        self.assertEqual(lead.name, 'Updated Name')

    def test_partial_update_status(self):
        """PATCH can update just the status field."""
        lead     = self.create_lead(status='new')
        url      = reverse('lead-detail', kwargs={'pk': lead.pk})
        response = self.client.patch(url, {'status': 'contacted'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lead.refresh_from_db()
        self.assertEqual(lead.status, 'contacted')

    def test_partial_update_notes(self):
        """PATCH can update just the notes field."""
        lead     = self.create_lead(notes='')
        url      = reverse('lead-detail', kwargs={'pk': lead.pk})
        response = self.client.patch(url, {'notes': 'Called on Tuesday'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        lead.refresh_from_db()
        self.assertEqual(lead.notes, 'Called on Tuesday')


class LeadDeleteTests(LeadTestCase):
    """DELETE /api/leads/{id}/"""

    def test_delete_lead(self):
        """User can delete their own lead."""
        lead     = self.create_lead()
        url      = reverse('lead-detail', kwargs={'pk': lead.pk})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Lead.objects.count(), 0)

    def test_delete_reduces_count(self):
        """Deleting one lead from two leaves one remaining."""
        lead_a = self.create_lead(name='Keep')
        lead_b = self.create_lead(name='Delete me', email='delete@example.com')

        url = reverse('lead-detail', kwargs={'pk': lead_b.pk})
        self.client.delete(url)

        self.assertEqual(Lead.objects.count(), 1)
        self.assertTrue(Lead.objects.filter(pk=lead_a.pk).exists())


# ─── 2. Ownership Tests ───────────────────────────────────────────────────────

class LeadOwnershipTests(LeadTestCase):
    """Users must only see and modify their own leads."""

    def test_user_cannot_see_other_users_leads(self):
        """user_b's leads do not appear in user_a's list."""
        self.create_lead(user=self.user_a, name='A Lead')
        self.create_lead(user=self.user_b, name='B Lead', email='b@example.com')

        url      = reverse('lead-list')
        response = self.client.get(url)  # authenticated as user_a

        results = response.data if isinstance(response.data, list) else response.data.get('results', [])
        names   = [r['name'] for r in results]

        self.assertIn('A Lead', names)
        self.assertNotIn('B Lead', names)

    def test_user_cannot_retrieve_other_users_lead(self):
        """user_a cannot access user_b's lead by ID — returns 404."""
        lead_b   = self.create_lead(user=self.user_b, email='b2@example.com')
        url      = reverse('lead-detail', kwargs={'pk': lead_b.pk})
        response = self.client.get(url)  # authenticated as user_a

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_cannot_update_other_users_lead(self):
        """user_a cannot PATCH user_b's lead — returns 404."""
        lead_b   = self.create_lead(user=self.user_b, email='b3@example.com')
        url      = reverse('lead-detail', kwargs={'pk': lead_b.pk})
        response = self.client.patch(url, {'status': 'won'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_cannot_delete_other_users_lead(self):
        """user_a cannot delete user_b's lead — returns 404."""
        lead_b   = self.create_lead(user=self.user_b, email='b4@example.com')
        url      = reverse('lead-detail', kwargs={'pk': lead_b.pk})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        # Lead still exists
        self.assertTrue(Lead.objects.filter(pk=lead_b.pk).exists())

    def test_each_user_only_counts_own_leads(self):
        """Stats endpoint returns counts scoped to the authenticated user only."""
        self.create_lead(user=self.user_a, name='A1')
        self.create_lead(user=self.user_a, name='A2', email='a2@example.com')
        self.create_lead(user=self.user_b, name='B1', email='b5@example.com')

        url      = reverse('lead-stats')
        response = self.client.get(url)  # authenticated as user_a

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total'], 2)  # only user_a's leads


# ─── 3. Filtering Tests ───────────────────────────────────────────────────────

class LeadFilteringTests(LeadTestCase):
    """Filter leads by status and source via query params."""

    def setUp(self):
        super().setUp()
        # Create a spread of leads across statuses and sources
        self.create_lead(name='New LinkedIn',    status='new',         source='linkedin', email='nl@example.com')
        self.create_lead(name='New Email',       status='new',         source='email',    email='ne@example.com')
        self.create_lead(name='Won Referral',    status='won',         source='referral', email='wr@example.com')
        self.create_lead(name='Lost LinkedIn',   status='lost',        source='linkedin', email='ll@example.com')
        self.create_lead(name='Progress Other',  status='in_progress', source='other',    email='po@example.com')

    def test_filter_by_status_new(self):
        """?status=new returns only new leads."""
        url      = reverse('lead-list')
        response = self.client.get(url, {'status': 'new'})
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(results), 2)
        self.assertTrue(all(r['status'] == 'new' for r in results))

    def test_filter_by_status_won(self):
        """?status=won returns only won leads."""
        url      = reverse('lead-list')
        response = self.client.get(url, {'status': 'won'})
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], 'Won Referral')

    def test_filter_by_status_in_progress(self):
        """?status=in_progress returns only in-progress leads."""
        url      = reverse('lead-list')
        response = self.client.get(url, {'status': 'in_progress'})
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], 'Progress Other')

    def test_filter_by_source_linkedin(self):
        """?source=linkedin returns only LinkedIn leads."""
        url      = reverse('lead-list')
        response = self.client.get(url, {'source': 'linkedin'})
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(results), 2)
        self.assertTrue(all(r['source'] == 'linkedin' for r in results))

    def test_filter_by_source_referral(self):
        """?source=referral returns only referral leads."""
        url      = reverse('lead-list')
        response = self.client.get(url, {'source': 'referral'})
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], 'Won Referral')

    def test_filter_status_and_source_combined(self):
        """?status=new&source=linkedin returns only leads matching both."""
        url      = reverse('lead-list')
        response = self.client.get(url, {'status': 'new', 'source': 'linkedin'})
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], 'New LinkedIn')

    def test_filter_no_results(self):
        """Filter with no matches returns empty list, not an error."""
        url      = reverse('lead-list')
        response = self.client.get(url, {'status': 'contacted'})
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(results), 0)

    def test_invalid_status_returns_empty(self):
        """Filter with a garbage status value returns empty list gracefully."""
        url      = reverse('lead-list')
        response = self.client.get(url, {'status': 'garbage_value'})
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(results), 0)


# ─── 4. Validation Tests ──────────────────────────────────────────────────────

class LeadValidationTests(LeadTestCase):
    """Email uniqueness per user and phone format validation."""

    def test_duplicate_email_same_user_rejected(self):
        """Same user cannot create two leads with the same email."""
        url = reverse('lead-list')
        self.client.post(url, self.valid_payload, format='json')

        # Second create with same email
        payload2 = {**self.valid_payload, 'name': 'Another Person'}
        response = self.client.post(url, payload2, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_duplicate_email_different_users_allowed(self):
        """Two different users CAN have leads with the same email."""
        url = reverse('lead-list')

        # user_a creates lead
        self.client.post(url, self.valid_payload, format='json')

        # Switch to user_b
        self.authenticate(self.user_b)
        response = self.client.post(url, self.valid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_email_stored_lowercase(self):
        """Email is normalised to lowercase on creation."""
        url     = reverse('lead-list')
        payload = {**self.valid_payload, 'email': 'JANE@EXAMPLE.COM'}
        self.client.post(url, payload, format='json')

        lead = Lead.objects.first()
        self.assertEqual(lead.email, 'jane@example.com')

    def test_update_email_uniqueness_excludes_self(self):
        """Updating a lead's email to its current value does not self-conflict."""
        lead = self.create_lead(email='jane@example.com')
        url  = reverse('lead-detail', kwargs={'pk': lead.pk})

        response = self.client.patch(url, {'email': 'jane@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_phone_too_short_rejected(self):
        """Phone numbers with fewer than 10 digits are rejected."""
        url     = reverse('lead-list')
        payload = {**self.valid_payload, 'email': 'short@example.com', 'phone': '12345'}
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('phone', response.data)

    def test_phone_with_plus_prefix_accepted(self):
        """Phone numbers with a + prefix and 10+ digits are valid."""
        url     = reverse('lead-list')
        payload = {**self.valid_payload, 'email': 'intl@example.com', 'phone': '+923001234567'}
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_phone_optional(self):
        """Phone field is optional — leads without it should be created fine."""
        url     = reverse('lead-list')
        payload = {**self.valid_payload, 'email': 'nophone@example.com', 'phone': ''}
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_email_optional(self):
        """Email field is optional — leads without it should be created fine."""
        url     = reverse('lead-list')
        payload = {**self.valid_payload}
        del payload['email']
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_invalid_status_choice_rejected(self):
        """Submitting a status not in choices is rejected with 400."""
        url     = reverse('lead-list')
        payload = {**self.valid_payload, 'email': 'bad@example.com', 'status': 'flying'}
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('status', response.data)

    def test_invalid_source_choice_rejected(self):
        """Submitting a source not in choices is rejected with 400."""
        url     = reverse('lead-list')
        payload = {**self.valid_payload, 'email': 'badsrc@example.com', 'source': 'tiktok'}
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('source', response.data)