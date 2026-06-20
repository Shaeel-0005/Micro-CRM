# Risks & Bugs

Severity: **P0** blocker · **P1** important · **P2** minor. Status: Open / Fixed / Monitoring.

---

## Active bugs

### #1 — P0 — Open
**Admin cannot change a lead's status/stage.**
Reported during Phase 2 stabilization. Almost certainly a permission-class or object-level check bug — likely the lead-update view checks `assigned_to`/`owner` instead of the `lead.edit_all` permission key for Admin/Manager. **Fix this before any further Phase 2 work** — it breaks the core role promise that Admin = full control.
Where to look first: the lead viewset's `has_object_permission`, and whether `status` updates go through a different code path (e.g. a dedicated "move stage" endpoint) than the general lead PATCH.

### #2 — P1 — Open
**Team invites have no email delivery.** Admin gets a token and must manually share it. Real UX gap for non-technical invitees, and a blocker to calling Phase 2 "done." See `03_DECISION_LOG.md` for options under consideration.

---

## Known non-blocking warnings
- JWT key length warning in logs — not yet addressed; fix before exposing more auth surface
- Pandas timezone warning in reporting — cosmetic, non-blocking

---

## Infrastructure risks to watch
- Production runs on a single AWS EC2 **t2.micro** instance — fine for pilot scale, but Celery + Postgres + Gunicorn sharing constrained RAM will become a real bottleneck before Phase 3 customer counts. Plan a resize or service split before scaling outreach.
- Single instance = single point of failure. **Worth explicitly confirming and documenting a backup/restore process for the production Postgres database** once Phase 2 ships — better to set this up deliberately than discover the gap during an incident.
- DuckDNS + Let's Encrypt is fine for pilot but isn't a permanent domain solution — revisit when moving from "pilot" framing to public pricing pages.

---

## Resolved
- ~~`runserver` crashing locally due to default Postgres connection~~ — fixed; local dev now defaults to SQLite when `DATABASE_URL` is unset.
- ~~Nested router blocking lead PATCH (405 errors) on the notes endpoint~~ — fixed; switched to `SimpleRouter`.
