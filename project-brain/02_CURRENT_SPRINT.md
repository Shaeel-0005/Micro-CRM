# Current Sprint

> Update this file every working session. This is the second file any AI tool should read (after `08_AI_HANDOFF.md`).

## Phase
**Phase 2 — stabilization** (core features built, fixing bugs and closing gaps before the Phase 3 gate: 20 paying customers)

## Sprint goal
Get Phase 2 to a state safe to put in front of real team users: fix the permission bug blocking admins, decide the invite-without-email workflow, confirm role enforcement end-to-end.

## In progress
- [ ] **P0 bug:** Admin cannot change a lead's `status`. Likely a permission-class or queryset issue in the leads viewset PATCH path — object-level check is probably falling back to `assigned_to`/`owner` instead of role. See `07_RISKS_BUGS.md` #1.
- [ ] Decide the invite-without-email workflow (see `03_DECISION_LOG.md` — open decision)

## Up next (this sprint, after the above)
- [ ] Verify the full role matrix against live endpoints (Admin / Manager / Member × view / edit / assign / delete / export / audit)
- [ ] Confirm the Phase 1 `Note` migration fully replaced old `LeadActivity` data with no orphaned records
- [ ] Re-run backend test suite (last known: 8/8 passing for workspaces, 11/11 for leads) — confirm still green after the bug fix

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

- _(add entries here as you work)_
