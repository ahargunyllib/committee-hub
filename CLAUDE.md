# CLAUDE.md

Context for Claude Code when working in this repository.

## Project

`committee-hub` is a monorepo for a campus event and committee management system. It has two apps: `apps/api` (backend) and `apps/dashboard` (frontend).

## Key Commands

Run from repo root unless noted.

| Command | Description |
|---|---|
| `bun dev` | Start all apps in dev mode |
| `bun --cwd apps/api dev` | Start API only |
| `bun --cwd apps/dashboard dev` | Start dashboard only |
| `bun --cwd apps/api db:push` | Push schema to database |
| `bun --cwd apps/api db:generate` | Generate migration files |
| `bun --cwd apps/api db:migrate` | Run migrations |
| `bun --cwd apps/api db:studio` | Open Drizzle Studio |
| `bun lint` | Lint all apps |
| `bun typecheck` | Type check all apps |

## Architecture

- **Monorepo** with Bun workspaces. No Turborepo.
- **Backend** (`apps/api`): ElysiaJS + Drizzle ORM + PostgreSQL + better-auth
- **Frontend** (`apps/dashboard`): Vite + React + TanStack Router + TanStack Query + shadcn/ui + Zustand + Zod
- **Auth**: better-auth server lives in `apps/api/src/lib/auth.ts`, client in `apps/dashboard/src/lib/auth.ts`
- **Auth**: Google OAuth via better-auth. After login, users get `mahasiswa` role by default. Admin upgrades roles manually.

## Module Structure (apps/api)

Each module follows the same pattern: `route → service → repository`.

```
src/modules/<module>/
  <module>.route.ts      # Elysia plugin, defines HTTP endpoints
  <module>.service.ts    # Business logic
  <module>.repository.ts # Drizzle queries
  <module>.schema.ts     # Drizzle table schema
```

Modules: `auth`, `committee`, `proposal`, `event`, `notification`, `admin`

## Coding Conventions

- Use TypeScript strictly. No `any`.
- Validation with Zod or ElysiaJS typebox, not manual checks.
- Services do not import from other services directly; use repository or internal events.
- Notifications are triggered via an in-process event emitter, not direct service calls.
- Keep route handlers thin; business logic belongs in the service layer.
- Drizzle schemas are the single source of truth for data shape.
- Use `snake_case` for database columns, `camelCase` for TypeScript.

## What Not To Do

- Do not add Redis or any external message broker; notifications are in-process.
- Do not create a `packages/auth` workspace; auth server stays in `apps/api`.
- Do not add email/password auth; Google OAuth is the only login method.
- Do not bypass the service layer from a route handler.
- Do not write raw SQL; use Drizzle query builder.
- Do not commit `.env` files.

## Environment Variables

See `apps/api/.env.example` and `apps/dashboard/.env.example` for required variables.

Key API vars: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
Key dashboard vars: `VITE_API_URL`
