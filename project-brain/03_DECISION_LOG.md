# Decision Log

> One entry per real architectural or product decision. Newest/open items first. Don't log trivial stuff — log things future-you or an AI would otherwise re-litigate or contradict.

Entry format:
```
## [STATUS] — Title
Context:
Decision:
Alternatives considered:
```

---

## [DECIDED] — Team invite flow without email
**Context:** Admin invites create a token but no email is sent. Invitee workflow was too manual (copy raw UUID).
**Decision:** Generate a shareable accept URL (`/invite/accept?token=...`) with **Copy link** and **Share via WhatsApp** buttons in Team Settings. Invitee signs up/logs in with the invited email, opens the link — auto-accepts if already authenticated. No SMTP in Phase 2; consistent with WhatsApp-first product pattern.
**Alternatives considered:**
- Wire SMTP/SendGrid/Resend (deferred — infra dependency, Phase 3 email integration)
- Defer entirely until Phase 3 (rejected — blocks real team onboarding now)

---

## [DECIDED] — Lead status field keeps its name
**Context:** Phase 1 spec called for a `stage` field; the codebase already had a `status` field with older, pre-agency choices.
**Decision:** Keep the field named `status`; only update the choice values to the agency pipeline stages (New Lead, Discovery Call, Proposal Sent, Negotiation, Won, Lost). Avoids backend + frontend churn renaming everywhere.
**Alternatives considered:** Rename to `stage` across backend and frontend.

---

## [DECIDED] — Note model replaces LeadActivity
**Context:** Codebase had `LeadActivity` for the timeline; Phase 1 spec asked for a separate `Note` model.
**Decision:** Created a new `Note` model (`lead`, `created_by`, `note_type` [call/email/whatsapp/general], `content`, `created_at`); deprecated `LeadActivity`. Migration `0003_phase1_schema.py` backfills existing activity + inline note data.
**Alternatives considered:** Evolve `LeadActivity` in place (less migration risk, more spec deviation).

---

## [DECIDED] — Single workspace per agency for now
**Context:** Future roadmap includes multi-brand agencies needing multiple workspaces.
**Decision:** One workspace per signup/agency in Phase 2. The `Workspace` FK and membership model are built so multi-workspace can extend later without a rewrite, but multi-workspace UI/logic is deferred to Phase 3.
**Alternatives considered:** Build multi-workspace support now.

---

## [DECIDED] — Permission model: RBAC + row-level visibility
**Context:** Needed a permission system simple enough for solo-founder maintenance but correct enough for real teams.
**Decision:** Three roles (Admin/Manager/Member) with a fixed permission key list (see `05_API_DATABASE_MAP.md`) enforced in DRF permission classes, plus row-level queryset scoping for Members (`assigned_to=me OR owner=me`).
**Alternatives considered:** Fully custom, per-permission configurability (too complex for current stage).

---

## [DECIDED] — Local dev defaults to SQLite
**Context:** `runserver` crashed locally because Django defaulted to Postgres on `localhost:5432` with no Postgres running at those credentials.
**Decision:** `development.py` settings default to SQLite (`db.sqlite3`) when `DATABASE_URL` is unset. Use Postgres/Docker for full-stack or production-like testing.

---

## [DECIDED] — Deferred features pushed explicitly to their phases
**Context:** Founder's full feature wishlist (invoicing, full WhatsApp API, RAG reports, AI assistant, multi-workspace) needed explicit phase placement to avoid scope creep into Phase 2.
**Decision:** Multi-workspace → Phase 3. Full invoice/accounting integration, full WhatsApp API automation, RAG reports/AI chat assistant → Phase 4. Workspace FK, audit log, and permission scaffolding are built now so Phase 4 can extend without a rewrite — but nothing from Phase 4 is implemented.
