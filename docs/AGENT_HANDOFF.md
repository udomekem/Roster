# Agent Handoff — Roster NDIS Platform

**Purpose:** This document enables another AI agent to continue building the Roster NDIS Workforce & Care Management Platform. Read this first, then reference AGENT.md and docs/PROJECT_CONTEXT.md.

---

## 1. Project Summary

A multi-tenant SaaS platform for Australian disability support providers (NDIS). Phase 1 (MVP) and Phase 2 (Workforce Automation) are functionally complete. The app handles rostering, care documentation, incident reporting, staff/participant management, availability tracking, shift broadcasting, and AI-powered features.

**Tech stack:** Next.js 16, React, TailwindCSS, Supabase (PostgreSQL, Auth, Storage, RLS), TanStack Query, OpenAI-compatible AI APIs.

**Repository:** https://github.com/udomekem/Roster

---

## 2. What Has Been Built

### Phase 1 — Core Operations (Complete)

| Area | Location |
|------|----------|
| Auth (login, register, forgot password) | `app/(auth)/`, `modules/auth/` |
| Organisation onboarding | `app/onboarding/`, `app/api/onboarding/` |
| Houses CRUD | `modules/houses/`, `app/dashboard/houses/` |
| Staff management + invite | `modules/staff/`, `app/api/staff/invite/` |
| Participants CRUD | `modules/participants/`, `app/dashboard/participants/` |
| Rostering (shifts, assign, accept/decline) | `modules/rostering/`, `app/dashboard/roster/` |
| Case notes (with file attachments) | `modules/case-notes/`, `app/dashboard/case-notes/` |
| Incident reporting (with file attachments) | `modules/incidents/`, `app/dashboard/incidents/` |
| Notifications (list, mark read, triggers) | `modules/notifications/`, `app/api/notifications/` |
| Audit logging | `app/api/audit-logs/`, `lib/audit-log.ts` |
| Settings (profile, org) | `app/dashboard/settings/` |
| Dashboard overview | `app/dashboard/page.tsx`, `modules/dashboard/` |
| Database schema + RLS | `supabase/migrations/00001_initial_schema.sql` |
| UI components | `components/ui/`, `components/layout/` |
| Seed data | `supabase/seed.sql` |

### Phase 2 — Workforce Automation (Complete)

| Area | Location |
|------|----------|
| Staff availability calendar (personal) | `modules/availability/components/availability-calendar.tsx` |
| Team availability view (admin/leader) | `modules/availability/components/team-availability-view.tsx` |
| Availability service + hooks | `modules/availability/services/`, `modules/availability/hooks/` |
| Shift broadcast system | `modules/broadcasts/`, `app/dashboard/broadcasts/` |
| Broadcast create/respond/accept | `modules/broadcasts/components/` |
| AI: Voice-to-case-note | `modules/ai/components/voice-to-casenote.tsx`, `app/api/ai/voice-to-casenote/` |
| AI: Shift summary generation | `modules/ai/components/shift-summary-generator.tsx`, `app/api/ai/shift-summary/` |
| AI: Replacement worker suggestions | `modules/ai/components/replacement-suggestions.tsx`, `app/api/ai/suggest-replacements/` |
| AI client (OpenAI-compatible) | `lib/ai/client.ts` |
| Phase 2 migration | `supabase/migrations/00002_phase2_workforce_automation.sql` |

### Not Yet Implemented

- **Phase 3** — Operational intelligence (familiarity score, stability score, behaviour detection, compliance)
- **Phase 4** — NDIS funding intelligence (funding profiles, utilisation dashboards, budget forecasting)

---

## 3. How to Run the Project

### Prerequisites

- Node.js 18+
- Supabase project (or local Supabase via CLI)

### Setup

1. Clone: `git clone https://github.com/udomekem/Roster.git && cd Roster`
2. Install: `npm install`
3. Env: Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY` (for AI features)
   - `OPENAI_API_URL` (defaults to `https://api.openai.com/v1`)
   - `AI_MODEL` (defaults to `gpt-4o-mini`)
4. Migrations: In Supabase SQL Editor, run in order:
   - `supabase/migrations/00001_initial_schema.sql`
   - `supabase/migrations/00002_phase2_workforce_automation.sql`
5. Dev: `npm run dev` → http://localhost:3000

### First-Time Flow

1. Register at `/register`
2. Complete onboarding at `/onboarding` (creates org + super admin profile)
3. Optionally run `supabase/seed.sql` to add sample houses and participants
4. Use dashboard to manage houses, staff, participants, roster, availability, broadcasts

---

## 4. Architecture Overview

### Module Pattern

Each domain module follows:

```
modules/{domain}/
├── components/     # UI
├── hooks/          # TanStack Query hooks
└── services/       # Supabase queries (createClient() per call)
```

### Supabase Clients

- `lib/supabase/client.ts` — browser (client components)
- `lib/supabase/server.ts` → `createClient()` — server (Server Components, API routes)
- `lib/supabase/server.ts` → `createServiceClient()` — service role (onboarding, staff invite, AI routes)

### Multi-Tenancy

- All tables have `organisation_id`
- RLS enforces org isolation via `get_user_organisation_id()` and `get_user_role()`
- Middleware redirects users without a `staff_profiles` row to `/onboarding`

### Key Conventions

- Services call `createClient()` inside each function (not at module scope)
- Insert/update payloads cast as `Record<string, unknown>` for Supabase client
- Types: `types/database.ts` (table types), `types/index.ts` (composite types)
- Constants: `lib/constants.ts` (roles, statuses, categories)
- AI routes use server-side `createClient()` for auth, `createServiceClient()` for data

---

## 5. Important Files Reference

| File | Purpose |
|------|---------|
| `AGENT.md` | Product spec, phases, rules — follow this |
| `docs/PROJECT_CONTEXT.md` | Architecture, full schema, RLS strategy |
| `middleware.ts` | Auth guard, redirects |
| `lib/supabase/middleware.ts` | Session refresh, org/profile checks |
| `supabase/migrations/00001_initial_schema.sql` | Phase 1 schema + RLS + storage |
| `supabase/migrations/00002_phase2_workforce_automation.sql` | Phase 2 tables + RLS |
| `types/database.ts` | All table/row types |
| `types/index.ts` | Composite types and type aliases |
| `lib/constants.ts` | Roles, statuses, categories, broadcast statuses |
| `lib/ai/client.ts` | OpenAI-compatible chat completion client |

---

## 6. Recommended Next Tasks (Priority Order)

### Phase 3 — Operational Intelligence

1. **Staff familiarity score** — calculate how familiar each staff member is with each house/participant based on past shift history. Surface in staff profiles and shift assignment UI.
2. **House stability score** — measure consistency of staffing at each house. Flag houses with high turnover or frequent unplanned changes.
3. **Behaviour pattern detection** — analyze case notes over time to detect trends (escalating behaviour, medication issues, mood changes). Surface in participant profiles.
4. **Compliance alerts** — flag when required documentation is missing (e.g., no case note after a shift, incidents without resolution, overdue reviews).

### Phase 4 — NDIS Funding Intelligence

5. **Participant funding profiles** — track NDIS plan details, funding categories, budgets.
6. **Roster-to-funding mapping** — link shifts to funding line items for cost tracking.
7. **Funding utilisation dashboards** — visualize spend vs. allocated funding.
8. **AI budget forecasting** — predict funding usage trends and flag at-risk plans.

### Polish

9. Run `npm run build` and fix any build errors with env vars set.
10. Add error boundaries and better error handling for failed mutations.
11. Add real-time subscription for notifications using Supabase Realtime.
12. Add download/view links for file attachments in case notes and incidents.

---

## 7. Known Issues and Gotchas

- **Build:** May fail if Supabase env vars are missing during static generation; pages using Supabase are marked `dynamic = 'force-dynamic'`
- **Middleware:** Skips auth when env vars are missing (allows build to complete)
- **Staff invite:** Uses `auth.admin.createUser` with `email_confirm: true` — no email verification flow
- **AI features:** Require `OPENAI_API_KEY` env var. Without it, AI routes return 500 with a descriptive error.
- **Supabase service client joins:** The untyped service client returns joined relations as arrays. API routes use `as unknown as` casts for type safety.

---

## 8. Instructions for the Receiving Agent

1. Read this file fully
2. Read `AGENT.md` for product rules and phased roadmap
3. Read `docs/PROJECT_CONTEXT.md` for complete schema and RLS strategy
4. Set up environment (Section 3) and verify the app runs
5. Pick tasks from Section 6 in priority order
6. Follow existing patterns: services → hooks → components
7. Keep changes modular and avoid unnecessary abstraction
8. Update `docs/PROJECT_CONTEXT.md` when adding features

---

## 9. Context

This handoff was created after Phase 2 Workforce Automation implementation. The codebase is on GitHub at https://github.com/udomekem/Roster. All development should follow the principles in AGENT.md: simplicity, speed, reliability, mobile usability, and sub-30-second flows for core actions.
