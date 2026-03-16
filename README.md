# Roster — NDIS Workforce & Care Management Platform

A scalable SaaS platform for disability support providers operating under Australia's NDIS framework. Rostering, care documentation, and operational intelligence for disability service providers.

## Tech Stack

- **Frontend:** Next.js 16, React, TailwindCSS, TanStack Query
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime, RLS)
- **AI (Phase 2+):** OpenAI-compatible LLM APIs

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Setup

1. **Clone and install**

   ```bash
   git clone <your-repo-url>
   cd Roster
   npm install
   ```

2. **Configure environment**

   Copy `.env.local.example` to `.env.local` and add your Supabase credentials:

   ```bash
   cp .env.local.example .env.local
   ```

   Required variables:

   - `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` — Service role key (server-side only, for onboarding and staff invite)

3. **Run database migration**

   In your Supabase project, open the SQL Editor and run the contents of:

   ```
   supabase/migrations/00001_initial_schema.sql
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### First-time setup flow

1. Register a new account at `/register`
2. Complete organisation onboarding at `/onboarding`
3. You'll be redirected to the dashboard as a Super Admin
4. Add houses, invite staff, add participants, create shifts, and start documenting care

## Project Structure

```
app/                    # Next.js App Router
  (auth)/               # Login, register, forgot password
  dashboard/            # Authenticated app (houses, staff, roster, etc.)
  api/                  # API routes
components/             # Shared UI components
modules/                # Domain modules (houses, staff, rostering, etc.)
lib/                    # Supabase clients, utils, constants
hooks/                  # Shared React hooks
supabase/migrations/    # Database schema and RLS
```

## User Roles

- **Super Admin** — Full org management, staff CRUD, all rosters, analytics
- **Team Leader** — Roster management, staff assignment, case note/incident review
- **Staff** — View shifts, accept/decline, submit case notes and incident reports

## License

Private — All rights reserved.
