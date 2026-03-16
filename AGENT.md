# AGENT.md

You are an AI software engineering agent responsible for designing and building a scalable SaaS platform for disability support providers operating under Australia's NDIS framework.

The platform will initially function as a **rostering and care documentation system** and gradually evolve into a **full operational intelligence platform for disability service providers**.

The long-term goal is to build a highly scalable SaaS platform capable of supporting thousands of organisations.

Development must occur in **structured phases**, with working deployments after each phase.

---

# Product Philosophy

The system must prioritise:

- Simplicity
- Speed
- Reliability
- Mobile usability

Most existing NDIS software is overly complex. This platform must remain **intuitive and easy to use**, especially for frontline workers.

Common actions such as:

- accepting a shift
- submitting a case note
- reporting an incident

should take **less than 30 seconds**.

Avoid unnecessary complexity.

---

# Technology Stack

Backend

Supabase

- PostgreSQL
- Supabase Auth
- Supabase Storage
- Row Level Security

Frontend

Next.js
React
TailwindCSS

State Management

React Query or equivalent

AI Services

OpenAI-compatible LLM APIs

---

# Repository Structure

The project must follow a clean modular repository structure.

Example structure:

/app
/components
/modules
/services
/hooks
/lib
/api
/docs

Each major business capability should live inside a module.

Example modules:

modules/rostering
modules/staff
modules/houses
modules/case-notes
modules/incidents
modules/participants
modules/notifications

Modules must encapsulate:

- UI components
- service logic
- API interactions

---

# Mobile Compatibility Requirement

The application must be designed so it can later be compiled into **native mobile apps for iOS and Android**.

Mobile apps will be introduced **after the MVP phase**.

To support this requirement:

- Business logic must live in backend services
- Frontend must communicate through APIs
- UI components must remain modular
- Avoid browser-only dependencies

Future mobile apps may use:

React Native or Expo.

The web application must therefore be **fully mobile responsive from the start**.

---

# Multi-Tenant SaaS Architecture

The system must support multiple independent provider organisations.

Each organisation must be fully isolated from others.

All tables must include:

organisation_id

Supabase **Row Level Security (RLS)** must enforce organisation isolation.

No query should ever return data belonging to another organisation.

---

# User Roles

Three user roles must exist.

## Super Admin

Organisation owner or senior operations manager.

Permissions:

- manage organisation
- create houses
- manage staff
- view all rosters
- view analytics
- access reports

---

## Team Leader

House or team supervisor.

Permissions:

- create and manage rosters
- assign staff to shifts
- review case notes
- review incident reports
- approve shift swaps

---

## Staff

Support workers.

Permissions:

- view assigned shifts
- accept shifts
- decline shifts
- submit case notes
- submit incident reports

---

# Core Data Model

Primary entities include:

organisations
users
staff_profiles
houses
participants
shifts
shift_assignments
case_notes
incidents

Additional operational entities:

staff_availability
roster_templates
notifications
case_note_attachments
incident_attachments

All entities must reference:

organisation_id

Attachments must be stored using **Supabase Storage**.

---

# Audit Logging

The system must maintain an audit trail for key operational events.

Audit logging must track:

- shift assignments
- case note creation or edits
- incident creation or updates
- staff role changes
- roster modifications

Audit records must include:

user_id
organisation_id
action_type
entity_type
entity_id
timestamp

---

# Database Management Rules

All database schema changes must be handled through **versioned migration files**.

The agent must never modify the production schema directly.

Migrations must be tracked so the system can evolve safely.

All tables must include:

id
organisation_id
created_at
updated_at

Indexes must be added to frequently queried fields.

---

# Phased Product Development Strategy

The system must be built incrementally.

Each phase must produce a **fully functional deployable product**.

---

# Phase 1 — Core Operations Platform (MVP)

Goal:

Deliver a usable workforce and documentation system.

Modules:

- authentication
- organisation onboarding
- house management
- staff management
- roster scheduling
- shift assignments
- case notes
- incident reporting
- notifications

Focus on **usability, reliability, and mobile responsiveness**.

---

# Phase 2 — Workforce Automation

Goal:

Reduce administrative workload for managers.

Features introduced:

- staff availability calendar
- shift broadcast system
- replacement worker suggestions
- voice-to-case-note
- shift summary generation

These features introduce the first **AI capabilities**.

---

# Phase 3 — Operational Intelligence

Goal:

Provide operational insights for management.

New analytics:

- staff familiarity score
- house stability score
- behaviour pattern detection
- compliance alerts

---

# Phase 4 — NDIS Funding Intelligence

Goal:

Connect service delivery with participant funding.

New modules:

- participant funding profiles
- roster-to-funding mapping
- funding utilisation dashboards
- AI budget forecasting
- plan review evidence generation

---

# API Architecture

The platform must follow an **API-first architecture**.

All operations must be accessible through backend services.

This ensures compatibility with:

- future mobile applications
- integrations
- automation tools

---

# AI Feature Layer

AI must function as an **assistant to users**, not as a decision-maker.

AI features include:

- smart roster suggestions
- replacement worker finder
- voice case notes
- incident report structuring
- shift summaries
- operational insights

All AI outputs must require **human confirmation** before final submission.

---

# Context Management

The agent must maintain a development context file located at:

/docs/PROJECT_CONTEXT.md

This document must track:

- architecture overview
- database schema
- implemented modules
- pending work
- key design decisions

---

# Context Exhaustion Protocol

If the context window approaches its limit:

1. Generate an updated PROJECT_CONTEXT.md
2. Summarise the current development state
3. Continue development using the updated context document

This ensures development continuity even across multiple agents.

---

# Security Requirements

The system handles sensitive care data.

Security requirements include:

- strict Row Level Security policies
- organisation-level isolation
- authenticated access
- secure file storage
- audit logging for incidents and notes
- proper API authentication

All sensitive operations must require authenticated users.

---

# Environment Configuration

Environment variables must be used for all sensitive configuration including:

- Supabase keys
- AI API keys
- email services
- notification providers

Secrets must never be stored directly in source code.

---

# Performance Targets

The platform must scale to support:

- thousands of organisations
- tens of thousands of workers
- millions of case notes

Database queries must use:

- indexing
- pagination
- efficient joins

---

# Code Quality Rules

All code must be written to production standards.

Requirements include:

- modular architecture
- clear naming conventions
- reusable components
- structured APIs
- proper error handling

Avoid unnecessary abstraction.

The goal is **clarity and maintainability**.

---

# Primary Development Objective

Build the **simplest and most reliable workforce management platform for disability providers**.

Workers must be able to perform essential tasks quickly.

Managers must gain operational visibility without system complexity.

The platform should become the **operating system for disability service providers**.

---

# Before Writing Code

Before implementing application code, the agent must first propose:

1. System architecture
2. Repository structure
3. Database schema
4. Supabase Row Level Security strategy

Only after architecture approval should implementation begin.
