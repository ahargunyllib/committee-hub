# Development Guide

## Prerequisites

- [Bun](https://bun.sh) >= 1.x
- Docker and Docker Compose (for PostgreSQL)
- Git

## Setup

**1. Clone the repo**

```sh
git clone https://github.com/ahargunyllib/committee-hub.git
cd committee-hub
```

**2. Install dependencies**

```sh
bun install
```

**3. Configure environment variables**

```sh
cp apps/api/.env.example apps/api/.env
cp apps/dashboard/.env.example apps/dashboard/.env
```

Fill in the required values. Key variables:

`apps/api/.env`
- `DATABASE_URL` - PostgreSQL connection string (e.g., `postgresql://postgres:postgres@localhost:5432/committee_hub`)
- `BETTER_AUTH_SECRET` - Random secret for better-auth (generate with `openssl rand -base64 32`)
- `BETTER_AUTH_URL` - API base URL (e.g., `http://localhost:3000`)
- `GOOGLE_CLIENT_ID` - From Google Cloud Console OAuth credentials
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console OAuth credentials

`apps/dashboard/.env`
- `VITE_API_URL` - API base URL (e.g., `http://localhost:3000`)

**4. Push database schema**

```sh
bun --cwd apps/api db:push
```

**5. Start development servers**

```sh
bun dev
```

API runs at `http://localhost:3000`
Dashboard runs at `http://localhost:5173`
Swagger UI at `http://localhost:3000/swagger`

## Useful Commands

| Command | Description |
|---|---|
| `bun dev` | Start all apps |
| `bun --cwd apps/api db:push` | Sync schema to DB (dev only) |
| `bun --cwd apps/api db:generate` | Generate migration files |
| `bun --cwd apps/api db:migrate` | Run pending migrations |
| `bun --cwd apps/api db:studio` | Open Drizzle Studio at port 4983 |
| `bun lint` | Run linter across all apps |
| `bun typecheck` | Type check all apps |

## Database with Docker

Start the PostgreSQL container before running the API:

```sh
docker compose up -d db
```

This starts a PostgreSQL instance on port 5432. See `docker-compose.yml` for credentials.

## Adding a New Module

1. Create `apps/api/src/modules/<name>/` with the four standard files
2. Register the route plugin in `apps/api/src/index.ts`
3. Add the Drizzle schema to `apps/api/src/db/schema.ts`
4. Run `db:push` or `db:generate` + `db:migrate`

## Common Issues

**`DATABASE_URL` connection refused**
Make sure PostgreSQL is running. If using Docker: `docker compose up -d db`

**Type errors after schema change**
Run `bun --cwd apps/api db:push` to sync, then restart the TypeScript server in your editor.

**better-auth session issues**
Ensure `BETTER_AUTH_URL` matches the actual URL the dashboard is hitting. CORS issues usually mean this is misconfigured.
