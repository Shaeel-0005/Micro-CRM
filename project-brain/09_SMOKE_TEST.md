# Phase 2 Production Smoke Test

> Run after every Phase 2 deploy. Mark each item pass/fail. Phase 2 sign-off requires all checks green.

**Production URLs**
- Frontend: https://micro-crm-ten.vercel.app
- Backend: https://leadflow.duckdns.org/api
- Health: https://leadflow.duckdns.org/api/health/

**Pre-flight (server)**
```bash
# On EC2 / after deploy
python manage.py migrate
python manage.py audit_note_migration
python manage.py test apps.leads   # optional on CI; already green locally
```

---

## 1. Admin — lead status change (P0 regression)

| Step | Expected |
|------|----------|
| Log in as workspace **Admin** | Dashboard loads |
| Open **Pipeline** | Leads visible in columns |
| Drag a lead from **New Lead** → **Discovery Call** | Card stays in new column after refresh |
| Open same lead in detail panel → change status via dropdown | Status updates, no silent failure |
| Move a lead to **Lost** | Lost-reason modal appears; save succeeds |
| Move a **Lost** lead back to **Discovery Call** | Succeeds without sending `lost_reason: null` manually |

---

## 2. Admin — invite flow (no email)

| Step | Expected |
|------|----------|
| **Settings → Team** → Create invite for a new email | Invite created; link shown |
| Click **Copy link** | Full URL copied (`/invite/accept?token=...`) |
| Click **WhatsApp** | Opens wa.me with pre-filled message |
| In incognito: sign up with **same email** as invite | Account created |
| Open invite link while logged in | Auto-accepts → redirects to dashboard |
| New user sees workspace leads per **Member** role | Only assigned/owned leads |

---

## 3. Role matrix (need 3 test accounts or role changes)

| Action | Admin | Manager | Member |
|--------|-------|---------|--------|
| See all workspace leads | ✓ | ✓ | ✗ (assigned/owned only) |
| PATCH any lead status | ✓ | ✓ | assigned only |
| Export CSV (Settings or Contacts) | ✓ | ✓ | hidden / 403 |
| View audit log | ✓ | ✓ | hidden / 403 |
| Change member roles | ✓ | ✗ | ✗ |

---

## 4. Phase 1 regression

| Step | Expected |
|------|----------|
| Open lead → add **Note** (call/whatsapp/general) | Appears in timeline |
| **Dashboard** money stats load | Pipeline value, overdue count shown |
| Click **WhatsApp** on lead with phone | Opens wa.me with template |

---

## Sign-off

| Check | Date | Pass? |
|-------|------|-------|
| Admin status PATCH | | |
| Invite link + accept | | |
| Member visibility | | |
| Notes + money_stats | | |
| `audit_note_migration` on prod DB | | |

When all pass → Phase 2 stabilization complete. Update `02_CURRENT_SPRINT.md` and check Phase 2 items in `04_FEATURE_BACKLOG.md`.
