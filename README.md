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
