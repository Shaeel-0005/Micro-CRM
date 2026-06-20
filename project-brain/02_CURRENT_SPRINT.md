# Current Sprint

> Update this file every working session. This is the second file any AI tool should read (after `08_AI_HANDOFF.md`).

## Phase
**Phase 2 — stabilization** (core features built, fixing bugs and closing gaps before the Phase 3 gate: 20 paying customers)

## Sprint goal
Get Phase 2 to a state safe to put in front of real team users: fix the permission bug blocking admins, decide the invite-without-email workflow, confirm role enforcement end-to-end.

## In progress
- [ ] Manual smoke test on production — use `09_SMOKE_TEST.md` checklist

## Done this sprint
- [x] **P0 bug:** Admin cannot change lead `status` — fixed (`perform_update` used `self.instance`; serializer auto-clears `lost_reason`; frontend surfaces errors)
- [x] **Invite-without-email workflow** — shareable link + Copy + WhatsApp share; auto-accept when logged in (see `03_DECISION_LOG.md`)
- [x] **Role matrix tests** — Admin/Manager/Member PATCH, export CSV, audit log
- [x] **Note migration audit** — schema tests + static 0003 check + `python manage.py audit_note_migration` for prod/local DB
- [x] **Phase 1 regression tests** — notes CRUD, `money_stats`, `stats`, invite accept flow
- [x] **Full backend suite** — **25/25 OK** (apps.leads)

## Up next
- [ ] Complete production smoke test (`09_SMOKE_TEST.md`) and mark Phase 2 sign-off

## Blocked / waiting
- None currently

## Explicitly NOT this sprint
- Anything from Phase 3 (onboarding pipeline, forecasting, custom fields, multi-workspace, email integration)
- Anything from Phase 4 (WhatsApp API, automations, AI, billing)

## Definition of done for this sprint
- Admin role can perform every action listed in its permission row in `01_ARCHITECTURE_MAP.md`, verified by manual test or automated test
- Invite flow decision logged in `03_DECISION_LOG.md` and implemented
- No regressions in Phase 1 leads / notes / money_stats endpoints

---

## Session log
> Optional, append-only. One line per session: date, what you touched, what's left.

- 2026-06-17 — Fixed P0 lead status PATCH; WhatsApp invite links; role-matrix tests (17/17). Left: Note migration audit + prod smoke test.
- 2026-06-17 — Note migration audit (25/25 tests), `audit_note_migration` command. Committed `7b85ab0`, pushed main. Added `09_SMOKE_TEST.md`. Left: prod smoke test.
- 2026-06-20 — Refactored dashboard shell to use live user/workspace data, project-only nav, and settings anchors for team/audit/export.
