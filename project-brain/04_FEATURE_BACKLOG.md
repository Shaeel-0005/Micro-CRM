# Feature Backlog — by Phase

> Rule: do not build a feature out of its phase. Exception: critical security bugs. If unsure which phase something belongs to, check here first; if it's not listed, ask before building it.

## Phase 1 — "Get Paid" — ✅ SHIPPED
Goal: minimum to take the first payment from 5 pilot customers.
- [x] Agency pipeline: New Lead → Discovery Call → Proposal Sent → Negotiation → Won/Lost
- [x] Deal value (PKR/USD), expected close date, assigned_to
- [x] Drag-and-drop pipeline (`@dnd-kit`)
- [x] Click-to-WhatsApp button (`wa.me` link, pre-filled template)
- [x] Note timeline (call/email/whatsapp/general)
- [x] Lead source tracking (Referral, FB Ads, LinkedIn, Cold Outreach, Website, WhatsApp)
- [x] Mandatory `lost_reason` on Lost
- [x] Lead assignment
- [x] Search/filter (name, company, stage, source, assigned user)
- [x] Money Dashboard (pipeline value, overdue follow-ups, win/loss + lost reasons, deals closing this month)

**Explicitly excluded from Phase 1 — do not revisit until their proper phase:** full WhatsApp API, email integration, complex automations, AI features, client portal, accounting/invoicing.

---

## Phase 2 — "Keep Them Paying" — 🟡 BUILT, STABILIZING
Goal: reduce churn below 10%, get testimonials from Phase 1 customers.
- [x] Workspace model + multi-tenancy foundation
- [x] WorkspaceMembership (Admin/Manager/Member roles)
- [x] Signup auto-creates workspace (creator = Admin)
- [x] Role-based lead visibility + permission classes
- [x] WorkspaceInvite (token-based; shareable link + WhatsApp — no email)
- [x] AuditLog (lead changes, role changes, invites, CSV export)
- [x] CSV export (Admin/Manager)
- [x] Lead tags + saved views
- [x] Basic proposal tracking (Drafted → Sent → Viewed → Accepted/Rejected)
- [x] **Fix: Admin cannot change lead status** (P0 — see `07_RISKS_BUGS.md` resolved)
- [x] Invite-without-email workflow (shareable link + WhatsApp)
- [x] Role-matrix automated test pass (25 tests)
- [x] Note migration audit (`audit_note_migration` + schema tests)
- [ ] Full role-matrix manual smoke on production

---

## Phase 3 — "Scale to 50 Customers" — ⛔ NOT STARTED
Gate: 20 paying customers. Goal: 50 paying customers, PKR 500K/month or $5K/month MRR.
- [ ] Client onboarding pipeline (separate board for Won deals)
- [ ] Revenue forecasting (deal value × close probability)
- [ ] Custom fields (admin-configurable, no code changes)
- [ ] Multi-workspace support (multiple brands/clients per agency)
- [ ] Basic email integration (send + track in timeline)
- [ ] Urdu localization

---

## Phase 4 — "Competitive Moat" — ⛔ NOT STARTED (design only)
Gate: 50 paying customers, proven product-market fit. Goal: 200+ customers, defensible position.
- [ ] Full WhatsApp Business API (two-way sync, automated sequences)
- [ ] Workflow automations (trigger → action builder)
- [ ] AI lead summaries
- [ ] AI lead scoring
- [ ] Subscription billing (Stripe/PayPal, automated invoicing, usage tiers)
- [ ] RAG reports / AI chat assistant

**Architecture is already designed for these** (workspace FK, audit log, permission scaffolding) — implementation has not started.

---

## Out of roadmap entirely
- Full accounting/invoicing system — integrate Xero/QuickBooks later instead of building one
- Project management / fulfillment features — "we do sales, not fulfillment"
