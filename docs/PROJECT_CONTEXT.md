# PROJECT_CONTEXT.md

Last updated: 2026-03-14

---

## Current Status

Phase: Phase 2 complete. Staff availability, shift broadcasts, and AI features implemented.

---

## Architecture Overview

### System Layers

```
Client Layer (Browser / Future Mobile)
    ↓
Next.js Server (App Router)
    ├── Middleware (auth session validation, redirect)
    ├── Server Components (data fetching via Supabase server client)
    ├── Client Components (interactivity, realtime subscriptions)
    └── API Routes /app/api/* (server-side logic, file uploads, mobile-ready)
    ↓
Supabase Backend
    ├── Supabase Auth (users, sessions)
    ├── PostgreSQL + RLS (all data, tenant isolation)
    ├── Supabase Storage (attachments)
    └── Supabase Realtime (live notifications)
    ↓
AI Layer — Phase 2+ (OpenAI-compatible APIs)
```

### Key Architectural Decisions

| Decision | Rationale |
|---|---|
| `organisation_id` on every table | RLS-based tenant isolation without partitioning complexity |
| `staff_profiles` linked to `auth.users` by PK | Single identity source; Supabase Auth handles passwords, sessions, MFA |
| Helper functions (`SECURITY DEFINER STABLE`) | Org/role lookups cached per transaction; avoids repeated subqueries |
| `updated_at` trigger | Guarantees consistency; app code cannot forget to set it |
| Service role for onboarding only | Minimises privileged access; everything else goes through RLS |
| Audit logs write-restricted | Inserts via server-side functions; only super_admins can read |
| Indexes on `organisation_id` + common filters | Queries stay fast at scale across millions of rows |
| Attachment path convention `{org_id}/{entity_id}/{file}` | Maps directly to storage RLS; no additional lookup needed |
| Next.js App Router with route groups | `(auth)` for public pages, `(dashboard)` for authenticated pages |
| Two Supabase clients (browser + server) | Both respect RLS; server client used in Server Components and API routes |
| TanStack Query (React Query) | Client-side caching, optimistic updates, background refetching |
| API routes for all write operations | Mobile-ready from day one; API-first architecture |

---

## Technology Stack

- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime, RLS)
- **Frontend:** Next.js (App Router), React, TailwindCSS
- **State Management:** TanStack Query (React Query)
- **AI Services:** OpenAI-compatible LLM APIs (Phase 2+)

---

## Repository Structure

```
Roster/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Public auth pages
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/                  # Authenticated pages
│   │   ├── layout.tsx                # Dashboard shell (sidebar, header)
│   │   ├── page.tsx                  # Dashboard home
│   │   ├── houses/
│   │   ├── staff/
│   │   ├── roster/
│   │   ├── case-notes/
│   │   ├── incidents/
│   │   ├── participants/
│   │   ├── notifications/
│   │   └── settings/
│   ├── onboarding/page.tsx           # Organisation onboarding flow
│   ├── api/                          # API routes (mobile-ready)
│   │   ├── shifts/
│   │   ├── case-notes/
│   │   ├── incidents/
│   │   └── notifications/
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Landing / redirect
│
├── components/                       # Shared UI components
│   ├── ui/                           # Primitives: Button, Card, Input, Badge
│   ├── layout/                       # Shell, Sidebar, Header, MobileNav
│   └── shared/                       # StatusBadge, RoleBadge, DatePicker
│
├── modules/                          # Business domain modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   ├── organisations/
│   ├── houses/
│   ├── staff/
│   ├── participants/
│   ├── rostering/
│   ├── case-notes/
│   ├── incidents/
│   └── notifications/
│
├── lib/                              # Core utilities
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client
│   │   ├── server.ts                 # Server Supabase client
│   │   └── middleware.ts             # Auth middleware helper
│   ├── constants.ts
│   └── utils.ts
│
├── hooks/                            # Shared React hooks
│   ├── use-user.ts
│   ├── use-organisation.ts
│   └── use-realtime.ts
│
├── types/                            # TypeScript definitions
│   ├── database.ts                   # Generated from Supabase
│   └── index.ts
│
├── supabase/                         # Supabase project config
│   ├── migrations/                   # Versioned SQL migration files
│   ├── seed.sql                      # Dev seed data
│   └── config.toml
│
├── docs/PROJECT_CONTEXT.md           # This file
├── public/
├── .env.local.example
├── AGENT.md
├── middleware.ts                      # Next.js middleware (auth guard)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### Module Anatomy

Each module under `modules/` follows this pattern:

```
modules/{domain}/
├── components/     # UI specific to this domain
├── hooks/          # TanStack Query hooks wrapping services
└── services/       # Supabase queries (typed client)
```

---

## Database Schema

### organisations

```sql
CREATE TABLE organisations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    slug            TEXT UNIQUE NOT NULL,
    abn             TEXT,
    phone           TEXT,
    email           TEXT,
    address         TEXT,
    logo_url        TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### staff_profiles

```sql
CREATE TABLE staff_profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    email           TEXT NOT NULL,
    full_name       TEXT NOT NULL,
    phone           TEXT,
    role            TEXT NOT NULL CHECK (role IN ('super_admin', 'team_leader', 'staff')),
    avatar_url      TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_staff_profiles_org ON staff_profiles(organisation_id);
CREATE INDEX idx_staff_profiles_role ON staff_profiles(organisation_id, role);
```

### houses

```sql
CREATE TABLE houses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    address         TEXT,
    phone           TEXT,
    capacity        INTEGER,
    notes           TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_houses_org ON houses(organisation_id);
```

### participants

```sql
CREATE TABLE participants (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id         UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    house_id                UUID REFERENCES houses(id) ON DELETE SET NULL,
    full_name               TEXT NOT NULL,
    date_of_birth           DATE,
    ndis_number             TEXT,
    phone                   TEXT,
    email                   TEXT,
    emergency_contact_name  TEXT,
    emergency_contact_phone TEXT,
    notes                   TEXT,
    is_active               BOOLEAN NOT NULL DEFAULT true,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_participants_org ON participants(organisation_id);
CREATE INDEX idx_participants_house ON participants(house_id);
```

### shifts

```sql
CREATE TABLE shifts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    house_id        UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ NOT NULL,
    status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'published', 'in_progress', 'completed', 'cancelled')),
    notes           TEXT,
    created_by      UUID NOT NULL REFERENCES staff_profiles(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shifts_org ON shifts(organisation_id);
CREATE INDEX idx_shifts_house_date ON shifts(house_id, date);
CREATE INDEX idx_shifts_status ON shifts(organisation_id, status);
```

### shift_assignments

```sql
CREATE TABLE shift_assignments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    shift_id        UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    staff_id        UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'no_show')),
    assigned_by     UUID NOT NULL REFERENCES staff_profiles(id),
    responded_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(shift_id, staff_id)
);

CREATE INDEX idx_shift_assignments_org ON shift_assignments(organisation_id);
CREATE INDEX idx_shift_assignments_staff ON shift_assignments(staff_id, status);
CREATE INDEX idx_shift_assignments_shift ON shift_assignments(shift_id);
```

### case_notes

```sql
CREATE TABLE case_notes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    participant_id  UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    shift_id        UUID REFERENCES shifts(id) ON DELETE SET NULL,
    house_id        UUID REFERENCES houses(id) ON DELETE SET NULL,
    author_id       UUID NOT NULL REFERENCES staff_profiles(id),
    content         TEXT NOT NULL,
    category        TEXT CHECK (category IN ('general', 'health', 'behaviour', 'medication', 'activity', 'other')),
    is_flagged      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_case_notes_org ON case_notes(organisation_id);
CREATE INDEX idx_case_notes_participant ON case_notes(participant_id);
CREATE INDEX idx_case_notes_author ON case_notes(author_id);
CREATE INDEX idx_case_notes_shift ON case_notes(shift_id);
```

### case_note_attachments

```sql
CREATE TABLE case_note_attachments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    case_note_id    UUID NOT NULL REFERENCES case_notes(id) ON DELETE CASCADE,
    file_name       TEXT NOT NULL,
    file_path       TEXT NOT NULL,
    file_type       TEXT,
    file_size       INTEGER,
    uploaded_by     UUID NOT NULL REFERENCES staff_profiles(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_case_note_attachments_note ON case_note_attachments(case_note_id);
```

### incidents

```sql
CREATE TABLE incidents (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id  UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    house_id         UUID REFERENCES houses(id) ON DELETE SET NULL,
    participant_id   UUID REFERENCES participants(id) ON DELETE SET NULL,
    reported_by      UUID NOT NULL REFERENCES staff_profiles(id),
    title            TEXT NOT NULL,
    description      TEXT NOT NULL,
    severity         TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status           TEXT NOT NULL DEFAULT 'open'
                     CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
    occurred_at      TIMESTAMPTZ NOT NULL,
    resolved_at      TIMESTAMPTZ,
    resolution_notes TEXT,
    reviewed_by      UUID REFERENCES staff_profiles(id),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_incidents_org ON incidents(organisation_id);
CREATE INDEX idx_incidents_house ON incidents(house_id);
CREATE INDEX idx_incidents_severity ON incidents(organisation_id, severity);
CREATE INDEX idx_incidents_status ON incidents(organisation_id, status);
```

### incident_attachments

```sql
CREATE TABLE incident_attachments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    incident_id     UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    file_name       TEXT NOT NULL,
    file_path       TEXT NOT NULL,
    file_type       TEXT,
    file_size       INTEGER,
    uploaded_by     UUID NOT NULL REFERENCES staff_profiles(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_incident_attachments_incident ON incident_attachments(incident_id);
```

### notifications

```sql
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    body            TEXT,
    type            TEXT NOT NULL
                    CHECK (type IN ('shift_assigned', 'shift_updated', 'shift_reminder',
                                    'case_note_flagged', 'incident_created', 'general')),
    reference_type  TEXT,
    reference_id    UUID,
    is_read         BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_org ON notifications(organisation_id);
```

### audit_logs

```sql
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES staff_profiles(id),
    action_type     TEXT NOT NULL,
    entity_type     TEXT NOT NULL,
    entity_id       UUID NOT NULL,
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_org ON audit_logs(organisation_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
```

### Automatic updated_at Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to: organisations, staff_profiles, houses, participants,
-- shifts, shift_assignments, case_notes, incidents
```

---

## Row Level Security Strategy

### Helper Functions

```sql
CREATE OR REPLACE FUNCTION get_user_organisation_id()
RETURNS UUID AS $$
    SELECT organisation_id FROM staff_profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
    SELECT role FROM staff_profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| organisations | Own org only | Via onboarding (service role) | Super admin only | Not permitted |
| staff_profiles | All in org | Super admin | Super admin or own profile | Not permitted |
| houses | All in org | Super admin, team leader | Super admin, team leader | Super admin |
| participants | All in org | Super admin, team leader | Super admin, team leader | Super admin |
| shifts | All in org | Super admin, team leader | Super admin, team leader | Super admin, team leader |
| shift_assignments | Own (staff) or all (admin/leader) | Super admin, team leader | Own status (staff) or all (admin/leader) | Super admin, team leader |
| case_notes | All in org | Any staff (as author) | Author or admin/leader | Not permitted |
| case_note_attachments | All in org | Any staff (as uploader) | Not permitted | Author or admin/leader |
| incidents | All in org | Any staff (as reporter) | Reporter or admin/leader | Not permitted |
| incident_attachments | All in org | Any staff (as uploader) | Not permitted | Reporter or admin/leader |
| notifications | Own only | Via server (service role) | Own only (mark read) | Not permitted |
| audit_logs | Super admin only | Via server (service role) | Not permitted | Not permitted |

### Organisation Onboarding (Special Case)

During registration the user has no `staff_profiles` row yet, so RLS helper functions return NULL. The onboarding flow uses a Next.js API route with the Supabase `service_role` key (server-side only, never exposed to client) to:

1. Create the `organisations` row
2. Create the `staff_profiles` row with `role = 'super_admin'`
3. Return the user to the dashboard

### Supabase Storage Policies

Storage buckets use org-scoped folder paths:

- Bucket: `case-note-attachments` — path: `{organisation_id}/{case_note_id}/{filename}`
- Bucket: `incident-attachments` — path: `{organisation_id}/{incident_id}/{filename}`

RLS on `storage.objects` checks `(storage.foldername(name))[1]::uuid = get_user_organisation_id()`.

---

## User Roles

| Role | Scope |
|---|---|
| super_admin | Full organisation management, staff CRUD, all rosters, analytics, reports, audit logs |
| team_leader | Roster/shift management, staff assignment, case note and incident review, shift swap approval |
| staff | View own shifts, accept/decline, submit case notes and incident reports |

---

## Phased Development Roadmap

### Phase 1 — Core Operations Platform (MVP) ← COMPLETE

Modules: authentication, organisation onboarding, house management, staff management, roster scheduling, shift assignments, case notes, incident reporting, notifications

### Phase 2 — Workforce Automation ← COMPLETE

Features: staff availability calendar, shift broadcast, replacement worker suggestions, voice-to-case-note, shift summary generation (first AI capabilities)

### Phase 3 — Operational Intelligence

Features: staff familiarity score, house stability score, behaviour pattern detection, compliance alerts

### Phase 4 — NDIS Funding Intelligence

Features: participant funding profiles, roster-to-funding mapping, funding utilisation dashboards, AI budget forecasting, plan review evidence generation

---

## Implemented Modules

- [x] Authentication (login, register, forgot password)
- [x] Organisation onboarding
- [x] Dashboard shell (sidebar, header, mobile nav)
- [x] House management
- [x] Staff management (invite, activate/deactivate)
- [x] Participant management
- [x] Rostering (shifts, assign, accept/decline)
- [x] Case notes (with file attachments)
- [x] Incident reporting (with file attachments, admin notifications)
- [x] Notifications (list, mark read, creation on shift assign + incident)
- [x] Audit logging (shifts, assignments, case notes, incidents)
- [x] Settings (profile, organisation)
- [x] Seed data (supabase/seed.sql)
- [x] Staff availability calendar (personal + team view)
- [x] Shift broadcast system (create, respond, accept/reject)
- [x] AI: Voice-to-case-note (transcript → structured note)
- [x] AI: Replacement worker suggestions (familiarity scoring)
- [x] AI: Shift summary generation

---

## Pending Work

- [ ] Phase 3: Operational intelligence (familiarity score, stability score, compliance)
- [ ] Phase 4: NDIS funding intelligence
