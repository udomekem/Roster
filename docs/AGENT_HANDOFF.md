# Agent Handoff — Roster NDIS Platform

**Purpose:** This document enables another AI agent to continue building the Roster NDIS Workforce & Care Management Platform. Read this first, then reference AGENT.md and docs/PROJECT_CONTEXT.md.

---

## 1. Project Summary

A multi-tenant SaaS platform for Australian disability support providers (NDIS). Phase 1 MVP is functionally complete. The app handles rostering, care documentation (case notes), incident reporting, staff and participant management, and notifications.

**Tech stack:** Next.js 16, React, TailwindCSS, Supabase (PostgreSQL, Auth, Storage, RLS), TanStack Query.

**Repository:** https://github.com/udomekem/Roster

---

## 2. What Has Been Built

### Completed (Phase 1 MVP)

| Area | Status | Location |
|------|--------|----------|
| Auth (login, register, forgot password) | Done | `app/(auth)/`, `modules/auth/` |
| Organisation onboarding | Done | `app/onboarding/`, `app/api/onboarding/` |
| Houses CRUD | Done | `modules/houses/`, `app/dashboard/houses/` |
| Staff management + invite | Done | `modules/staff/`, `app/api/staff/invite/` |
| Participants CRUD | Done | `modules/participants/`, `app/dashboard/participants/` |
| Rostering (shifts, assign, accept/decline) | Done | `modules/rostering/`, `app/dashboard/roster/` |
| Case notes | Done | `modules/case-notes/`, `app/dashboard/case-notes/` |
| Incident reporting | Done | `modules/incidents/`, `app/dashboard/incidents/` |
| Notifications list | Done | `modules/notifications/`, `app/dashboard/notifications/` |
| Settings (profile, org) | Done | `app/dashboard/settings/` |
| Dashboard overview | Done | `app/dashboard/page.tsx`, `modules/dashboard/` |
| Database schema + RLS | Done | `supabase/migrations/00001_initial_schema.sql` |
| UI components | Done | `components/ui/`, `components/layout/` |

### Not Yet Implemented

- **Notification creation** — `notifications` table exists but no code inserts rows (e.g. when shifts are assigned)
- **Audit logging** — `audit_logs` table exists but no triggers or app code writes to it
- **File uploads** — case note and incident attachment UI + Supabase Storage integration
- **Seed data** — dev seed SQL for testing
- **Phase 2+** — staff availability, shift broadcast, AI features (see AGENT.md)

---

## 3. How to Run the Project

### Prerequisites

- Node.js 18+
- Supabase project

### Setup

1. Clone: `git clone https://github.com/udomekem/Roster.git && cd Roster`
2. Install: `npm install`
3. Env: Copy `.env.local.example` to `.env.local` and add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Migration: In Supabase SQL Editor, run `supabase/migrations/00001_initial_schema.sql`
5. Dev: `npm run dev` → http://localhost:3000

### First-Time Flow

1. Register at `/register`
2. Complete onboarding at `/onboarding` (creates org + super admin)
3. Use dashboard to add houses, invite staff, add participants, create shifts

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
- `lib/supabase/server.ts` — server (Server Components, API routes)
- `lib/supabase/server.ts` → `createServiceClient()` — service role (onboarding, staff invite only)

### Multi-Tenancy

- All tables have `organisation_id`
- RLS enforces org isolation via `get_user_organisation_id()` and `get_user_role()`
- Middleware redirects users without a `staff_profiles` row to `/onboarding`

### Key Conventions

- Services use `createClient()` inside each function (not at module scope)
- Insert/update payloads are cast as `Record<string, unknown>` when passed to Supabase
- Types live in `types/database.ts` and `types/index.ts`

---

## 5. Important Files Reference

| File | Purpose |
|------|---------|
| `AGENT.md` | Product spec, phases, rules — follow this |
| `docs/PROJECT_CONTEXT.md` | Architecture, schema, RLS (partially outdated) |
| `middleware.ts` | Auth guard, redirects |
| `lib/supabase/middleware.ts` | Session refresh, org/profile checks |
| `supabase/migrations/00001_initial_schema.sql` | Full schema + RLS + storage policies |
| `types/database.ts` | Table/row types |
| `lib/constants.ts` | Roles, statuses, categories |

---

## 6. Recommended Next Tasks (Priority Order)

### High Priority — Phase 1 Completion

1. **Notification creation**
   - When a shift is assigned, insert into `notifications` (user_id = staff_id, type = 'shift_assigned', reference_id = shift_id)
   - Use service role or a Supabase Edge Function/trigger so RLS doesn’t block inserts
   - Option: add API route `POST /api/notifications` that creates notifications server-side

2. **Audit logging**
   - Add `insert_audit_log(org_id, user_id, action_type, entity_type, entity_id, metadata)` helper
   - Call it from API routes or services for: shift assignments, case note create/update, incident create/update, staff role changes, roster changes
   - Writes go through service role; only super_admins can read

3. **File uploads for case notes and incidents**
   - Storage buckets exist: `case-note-attachments`, `incident-attachments`
   - Path: `{organisation_id}/{entity_id}/{filename}`
   - Add upload UI in case note and incident forms
   - Add API route or Supabase client upload + insert into `case_note_attachments` / `incident_attachments`

4. **Seed data**
   - Create `supabase/seed.sql` with sample org, houses, staff, participants, shifts for local testing

### Medium Priority — Polish

5. Update `docs/PROJECT_CONTEXT.md` to match current implementation
6. Run `npm run build` and fix any build errors
7. Add error boundaries and better error handling for failed mutations

### Lower Priority — Phase 2

8. Staff availability calendar
9. Shift broadcast system
10. AI features: replacement worker suggestions, voice-to-case-note, shift summaries (see AGENT.md)

---

## 7. Known Issues and Gotchas

- **PROJECT_CONTEXT.md** says "Pre-implementation" and "None yet" — that’s outdated; Phase 1 is implemented
- **Build:** May fail if Supabase env vars are missing during static generation; pages using Supabase are marked `dynamic = 'force-dynamic'`
- **Middleware:** Skips auth when `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing (allows build to complete)
- **Staff invite:** Uses `auth.admin.createUser` with `email_confirm: true` — no email verification flow
- **Button size prop:** Some Button usages pass `size="sm"` — ensure the Button component supports it (it does in `components/ui/button.tsx`)

---

## 8. Instructions for the Receiving Agent

1. Read this file fully
2. Read `AGENT.md` for product rules and phased roadmap
3. Skim `docs/PROJECT_CONTEXT.md` for schema and RLS (ignore "Implemented: None")
4. Run the project locally (see Section 3) and verify it works
5. Pick tasks from Section 6 in priority order
6. Follow existing patterns: services → hooks → components, same folder structure
7. Keep changes modular and avoid unnecessary abstraction
8. Update `docs/PROJECT_CONTEXT.md` when adding features or changing architecture

---

## 9. Contact / Context

This handoff was created after Phase 1 MVP implementation. The codebase is on GitHub at https://github.com/udomekem/Roster. All development should follow the principles in AGENT.md: simplicity, speed, reliability, mobile usability, and sub-30-second flows for core actions.
