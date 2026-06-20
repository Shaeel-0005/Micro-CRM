# AI Handoff

> Read this file first, every session. It tells you how to behave on this project before you write any code.

## Read order
1. This file
2. `02_CURRENT_SPRINT.md` — what's actually being worked on right now
3. `00_PRODUCT_OVERVIEW.md` — what the product is and why
4. `01_ARCHITECTURE_MAP.md` — how it's built
5. Only then: the relevant code files

## Who you're working with
A solo founder, software engineering student, building this under real financial pressure — income needs to come from freelancing + this SaaS as soon as possible. Priority is shipping working, safe code — not perfect architecture. Don't over-engineer.

## Hard rules
1. **Check the phase before building anything.** This product is in Phase 2. If a request sounds like Phase 3 or 4 (multi-workspace, forecasting, custom fields, WhatsApp API, automations, AI features, billing), say so and ask before building — don't build it just because you're already in the file.
2. **Always check `02_CURRENT_SPRINT.md` first.** If what's being asked isn't the current sprint focus, flag the mismatch rather than silently switching tasks.
3. **Keep changes minimal and production-safe.** This is a live, deployed product (AWS EC2 + Vercel). No speculative refactors. No "while I'm in here" rewrites.
4. **Follow existing patterns.** Match conventions already in `apps/leads` and `apps/workspaces` (naming, serializer structure, permission class style) rather than introducing a new pattern.
5. **Permissions are enforced server-side, not just hidden in the UI.** Any feature touching roles or visibility must go through DRF permission classes + workspace-scoped querysets — check `05_API_DATABASE_MAP.md` for the permission key list before adding new logic.
6. **Log real decisions.** If you make an architectural call (model shape, field naming, library choice), it goes in `03_DECISION_LOG.md` — don't let it live only in chat history.
7. **If unsure which phase a feature belongs to, ask.** Don't guess and build. Check `04_FEATURE_BACKLOG.md` first — if it's not listed there, it hasn't been scoped yet.
8. **Build order:** backend models → migrations → serializers → views/permissions → frontend service → component. Test each layer before moving to the next.

## Current known blocker
None — P0 lead status bug fixed. Next: Phase 1 Note migration audit + production smoke test before Phase 2 sign-off.

## What NOT to build right now
- Full WhatsApp Business API integration
- Email integration beyond what `apps/reminders` already does
- AI features of any kind
- Client portal
- Accounting/invoicing
- Multi-workspace support
- Custom fields
- Workflow automation builder

These are all real, planned features — just not now. They're scoped under their correct phase in `04_FEATURE_BACKLOG.md`.

## When you finish a task
1. Update `02_CURRENT_SPRINT.md` (move the item to done, note what's next)
2. If you made an architectural decision, log it in `03_DECISION_LOG.md`
3. If you found a new bug or risk, add it to `07_RISKS_BUGS.md`
4. If you shipped a backlog item, check it off in `04_FEATURE_BACKLOG.md`
