# API & Database Map

## Models

### Workspace
| Field | Notes |
|---|---|
| name | agency name |
| created_at | |

### WorkspaceMembership
| Field | Notes |
|---|---|
| workspace | FK |
| user | FK |
| role | admin / manager / member |
| status | active / inactive |

### WorkspaceInvite
| Field | Notes |
|---|---|
| email | invitee email |
| role | assigned on accept |
| token | accept link uses this; currently shared manually, no email sent (open decision) |
| workspace | FK |

### AuditLog
| Field | Notes |
|---|---|
| actor | user who performed the action |
| action | e.g. `lead_updated`, `role_changed`, `invite_created`, `csv_exported` |
| target | object reference |
| metadata | before/after where relevant |
| created_at | |

### Lead
| Field | Notes |
|---|---|
| workspace | FK — all queries scoped by this |
| owner | creator |
| assigned_to | working rep |
| status | New Lead / Discovery Call / Proposal Sent / Negotiation / Won / Lost — field name kept as `status`, not renamed to `stage` (see decision log) |
| deal_value, deal_currency | PKR or USD |
| expected_close_date | |
| source | Referral / FB Ads / LinkedIn / Cold Outreach / Website / WhatsApp |
| lost_reason | required when `status=Lost` — Price / Ghosted / Competitor / Features / Timing |
| tags | Phase 2 |

### Note (replaces deprecated LeadActivity)
| Field | Notes |
|---|---|
| lead | FK |
| created_by | |
| note_type | call / email / whatsapp / general |
| content | |
| created_at | |

### Proposal (Phase 2, basic)
| Field | Notes |
|---|---|
| lead | FK |
| status | Drafted / Sent / Viewed / Accepted / Rejected |
| sent_date | |

### Tag / SavedView
Lightweight, workspace + user scoped — see `apps/leads`.

---

## API endpoints (current)

| Endpoint | Method | Who |
|---|---|---|
| `/api/workspaces/me/` | GET | any authenticated member |
| `/api/workspaces/members/` | GET / PATCH | GET: all; PATCH: Admin |
| `/api/workspaces/invites/` | GET / POST | Admin |
| `/api/workspaces/invites/accept/` | POST | invitee (via token) |
| `/api/workspaces/audit/` | GET | Admin, Manager |
| `/api/leads/` | CRUD | scoped by role — see permission matrix below |
| `/api/leads/{id}/notes/` | GET / POST | workspace members with access to that lead |
| `/api/leads/money_stats/` | GET | workspace members |
| `/api/leads/export_csv/` | GET | Admin, Manager |
| Tags / saved views / proposals | nested under `/api/leads/` | role-gated per action |

## Permission keys (enforced server-side, not just hidden in UI)
| Key | Who |
|---|---|
| `users.manage` | Admin only |
| `roles.manage` | Admin only |
| `lead.view_all` | Admin, Manager |
| `lead.view_assigned` | Member |
| `lead.create` | All |
| `lead.edit_all` | Admin, Manager |
| `lead.edit_assigned` | Member |
| `lead.delete` | Admin, Manager |
| `lead.assign` | Admin, Manager |
| `audit.view` | Admin, Manager |
| `export.csv` | Admin, Manager |
| `saved_views.manage` | All (private by default) |

**Known gap:** `lead.edit_all` for Admin currently fails for the `status` field specifically in production — see `07_RISKS_BUGS.md` #1. Check this permission key first when debugging any lead-update issue.
