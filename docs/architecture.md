# Architecture

## Overview

committee-hub is a **modular monolith** deployed as a single backend service alongside a separate frontend SPA. All business logic lives in one codebase, organized into clearly bounded modules. Business modules own their routes, service logic, and database queries.

See [ADR 002](adrs/002-modular-monolith.md) for the reasoning behind this choice.

## System Diagram

```
┌─────────────────┐        ┌──────────────────────────────────────────┐
│   apps/         │        │   apps/api                               │
│   dashboard     │ HTTP   │                                          │
│                 │ ──────►│  ElysiaJS                                │
│  React + Vite   │        │  ├── Better Auth handler                 │
│  TanStack       │        │  ├── committee module                    │
│  Router         │        │  ├── proposal module                     │
│  TanStack Query │        │  ├── event module                        │
│  shadcn/ui      │        │  ├── notification module                 │
│  Zustand        │        │  └── admin module                        │
└─────────────────┘        │           │                              │
                           │     Drizzle ORM                          │
                           └───────────┼──────────────────────────────┘
                                       │
                               ┌───────▼───────┐    ┌─────────────┐
                               │  PostgreSQL   │    │  SIAKAD API │
                               │  (primary DB) │    │  (or mock)  │
                               └───────────────┘    └─────────────┘
```

## Tech Stack

| Layer         | Technology      |
| ------------- | --------------- |
| Runtime       | Bun             |
| API Framework | ElysiaJS        |
| ORM           | Drizzle ORM     |
| Database      | PostgreSQL      |
| Auth          | better-auth     |
| Frontend      | React + Vite    |
| Routing       | TanStack Router |
| Data Fetching | TanStack Query  |
| UI Components | shadcn/ui       |
| State         | Zustand         |
| Validation    | Zod             |

## Module Breakdown (apps/api)

Business modules follow the `route → service → repository` pattern when the
workflow has business rules beyond simple persistence. The current v1 modules
are expected to grow into those workflows, so the scaffold keeps those
boundaries explicit. Auth is the exception: Better Auth owns the HTTP handler
and session flow directly.

| Module       | Responsibility                                               |
| ------------ | ------------------------------------------------------------ |
| committee    | Division management, committee recruitment, applicant review |
| proposal     | Proposal submission, multi-level approval workflow, revision |
| event        | Event CRUD, participant registration, ticket issuance        |
| notification | In-process event-driven notifications, notification feed     |
| admin        | User/role management, system config                          |

### Module Boundaries

- Route handlers call services and stay HTTP-focused.
- Services do not import services or repositories from other modules.
- Repositories may query shared/reference tables for DB-level invariants. For
  example, the event repository may check `userTable` before creating an event
  because `event.created_by_id` is a foreign key to Better Auth's `user` table.
- Cross-module side effects use internal events. For example, registration or
  proposal review can emit an event that the notification module listens to.
- Better Auth's `user`, `session`, `account`, and `verification` schemas live
  in `apps/api/src/db/auth.schema.ts` as auth infrastructure.

## Auth Flow

1. User clicks "Login with Google" on the dashboard
2. better-auth handles the OAuth redirect and callback
3. On first login, user is created with `mahasiswa` role by default
4. Session is stored in the database and returned to the client
5. All protected routes verify the session via better-auth middleware
6. Admin can upgrade a user's role via the admin module

The better-auth server instance lives in `apps/api/src/lib/auth.ts` and is
mounted directly into Elysia with `auth.handler`.
Better Auth OpenAPI metadata is merged into `/swagger/json`.
The client instance lives in `apps/dashboard/src/lib/auth.ts` and points to the API URL.
Google OAuth credentials are configured in `apps/api/.env`.

## Notification Flow

Notifications are in-process and event-driven:

1. A module emits an internal event (e.g., `proposal.approved`)
2. The notification module listens to these events
3. A notification record is written to the database
4. The frontend polls or fetches the notification feed

No external message broker is used. See [ADR 006](adrs/006-in-process-notifications.md).

## Deployment

- `apps/api` - Runs via Docker Compose locally
- `apps/dashboard` - Runs locally via `bun dev`
- `PostgreSQL` - Docker Compose service (`db`)
