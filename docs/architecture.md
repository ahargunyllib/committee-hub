# Architecture

## Overview

committee-hub is a **modular monolith** deployed as a single backend service alongside a separate frontend SPA. All business logic lives in one codebase, organized into clearly bounded modules. Each module owns its routes, service logic, and database queries.

See [ADR 002](adrs/002-modular-monolith.md) for the reasoning behind this choice.

## System Diagram

```
┌─────────────────┐        ┌──────────────────────────────────────────┐
│   apps/         │        │   apps/api                               │
│   dashboard     │ HTTP   │                                          │
│                 │ ──────►│  ElysiaJS                                │
│  React + Vite   │        │  ├── auth module                         │
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

Each module follows the `route → service → repository` pattern.

| Module       | Responsibility                                               |
| ------------ | ------------------------------------------------------------ |
| auth         | Login, registration, session, SIAKAD validation, JWT         |
| committee    | Division management, committee recruitment, applicant review |
| proposal     | Proposal submission, multi-level approval workflow, revision |
| event        | Event CRUD, participant registration, ticket issuance        |
| notification | In-process event-driven notifications, notification feed     |
| admin        | User/role management, system config                          |

## Auth Flow

1. User clicks "Login with Google" on the dashboard
2. better-auth handles the OAuth redirect and callback
3. On first login, user is created with `mahasiswa` role by default
4. Session is stored in the database and returned to the client
5. All protected routes verify the session via better-auth middleware
6. Admin can upgrade a user's role via the admin module

The better-auth server instance lives in `apps/api/src/lib/auth.ts`.
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
