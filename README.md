# committee-hub

Sistem sentralisasi manajemen acara dan SDM kepanitiaan kampus. Platform terpusat untuk rekrutmen panitia, workflow persetujuan proposal, manajemen acara, dan ticketing.

## Structure

```
committee-hub/
├── apps/
│   ├── api/          # Bun + ElysiaJS + Drizzle ORM
│   └── dashboard/    # Vite + React + TanStack Router
├── docs/             # Project documentation
├── CLAUDE.md         # Claude Code context
└── package.json      # Bun workspaces root
```

## Quick Start

Requires Bun and PostgreSQL.

```sh
# Install dependencies
bun i

# Setup environment variables
cp apps/api/.env.example apps/api/.env
cp apps/dashboard/.env.example apps/dashboard/.env

# Run Infrastructure (PostgreSQL)
docker compose up -d

# Push database schema
bun --cwd apps/api db:push

# Start development
bun dev
```

## Documentation

- [PRD](docs/prd.md) - Product requirements
- [Architecture](docs/architecture.md) - System design
- [ERD](docs/erd.md) - Data model
- [Development](docs/development.md) - Local setup guide
- [Workflow](docs/workflow.md) - Git and PR conventions
- [ADRs](docs/adrs/) - Architecture decision records

## Apps

| App | Port | Description |
|---|---|---|
| `apps/api` | 3000 | REST API + Swagger at `/swagger` |
| `apps/dashboard` | 5173 | Frontend dashboard |

## Deployment

Each app owns its Cloudflare Worker configuration:

- `apps/dashboard/wrangler.jsonc` deploys `apps/dashboard/dist` as Workers
  Static Assets with SPA fallback.
- `apps/api/wrangler.jsonc` deploys the Elysia API as a Cloudflare Worker.

Pushes to `main` run CI first, then deploy both Workers.

Configure these GitHub repository settings before the first deploy:

- Shared secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- Dashboard variables: `VITE_API_URL`, optional `VITE_ENABLE_DEV_ROLE_PANEL`
- API secrets: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
  `DASHBOARD_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

The API Worker can also use Cloudflare Hyperdrive by adding a `HYPERDRIVE`
binding in `apps/api/wrangler.jsonc`.
