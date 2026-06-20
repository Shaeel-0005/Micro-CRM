# Risks & Bugs

Severity: **P0** blocker · **P1** important · **P2** minor. Status: Open / Fixed / Monitoring.

---

## Active bugs

### #2 — P1 — Monitoring
**Team invites have no email delivery.** Mitigated for Phase 2: admin shares a one-click invite link via WhatsApp or copy-paste. Full email delivery remains Phase 3 (`04_FEATURE_BACKLOG.md`).

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
- ~~Admin cannot change a lead's status/stage~~ — fixed: `perform_update` used invalid `self.instance` (AttributeError after save); serializer now auto-clears `lost_reason` when leaving Lost; frontend shows PATCH errors.
- ~~`runserver` crashing locally due to default Postgres connection~~ — fixed; local dev now defaults to SQLite when `DATABASE_URL` is unset.
- ~~Nested router blocking lead PATCH (405 errors) on the notes endpoint~~ — fixed; switched to `SimpleRouter`.
