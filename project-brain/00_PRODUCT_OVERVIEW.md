# Product Overview

## What this is
LeadFlow CRM (working/code name; also referenced in places as **LinkView CRM**) — a micro-SaaS sales CRM built specifically for digital agencies, web development shops, and software houses.

## The problem
Agencies lose leads because they sell through WhatsApp chats, messy spreadsheets, and memory. HubSpot is too expensive and too complex for their scale. Spreadsheets don't send reminders.

## Who it's for
- **Primary market:** Pakistan (PKR pricing)
- **Secondary market:** Global agencies (USD pricing)
- **ICP:** small/solo digital agencies, web dev shops, software houses currently running sales through WhatsApp + spreadsheets, with no CRM or priced out of HubSpot

## Value proposition
"The Sales Command Center for Digital Agencies — stop losing leads in WhatsApp chats. Track proposals, automate follow-ups, and close more deals without the HubSpot headache."

## Tech stack
- **Backend:** Django + Django REST Framework, Celery (reminders/background jobs), PostgreSQL, JWT auth
- **Frontend:** React + Vite, Context API for state
- **Infra (local):** Docker + Docker Compose
- **Infra (production):** AWS EC2 (t2.micro, Ubuntu 22.04) — Nginx → Gunicorn (Unix socket) → Django; PostgreSQL; Celery + Redis; Let's Encrypt SSL via DuckDNS; GitHub Actions CI/CD; UptimeRobot monitoring. Frontend deployed on Vercel.
- **Repo:** github.com/Shaeel-0005/Micro-CRM

## Phase status snapshot
*(Full detail in `04_FEATURE_BACKLOG.md`)*

| Phase | Name | Status |
|---|---|---|
| 1 | Get Paid (pipeline, WhatsApp click-to-chat, money dashboard) | ✅ Shipped, deployed |
| 2 | Keep Them Paying (roles, permissions, audit log, CSV, tags, proposals) | 🟡 Built, stabilizing — known P0 bug active |
| 3 | Scale to 50 (onboarding, forecasting, custom fields, multi-workspace, email) | ⛔ Not started |
| 4 | Competitive Moat (WhatsApp API, automations, AI, billing) | ⛔ Not started — design only |

## Non-negotiable product rules
1. **North Star:** every feature must help an agency close deals, follow up faster, or stop losing leads. If it doesn't — backlog it.
2. **Phase discipline:** do not build Phase 3 or 4 features while in Phase 2. Exception: critical security bugs.
3. **WhatsApp-first, pragmatic:** click-to-chat now (Phase 1), full WhatsApp Business API later (Phase 4). Do not reverse this order.
4. **Agency-specific, not a generic CRM clone:** pipeline stages, fields, and dashboard all map to actual agency sales workflows.
5. **Pakistan-first, global-ready:** PKR + USD support now, Urdu localization in Phase 3, architecture built to scale globally.

## Founder context
Solo founder, software engineering student, building this under real financial pressure — income needs to come from freelancing + this SaaS as soon as possible. Priority is shipping working, safe code that gets to paying customers — not perfect architecture for its own sake. See `06_SALES_CUSTOMERS.md` for revenue targets and pilot tracking.
