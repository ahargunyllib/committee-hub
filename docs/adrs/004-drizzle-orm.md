# ADR 004 - Drizzle ORM over Prisma

**Status:** Accepted
**Date:** 2026-02

## Context

We needed an ORM or query builder for PostgreSQL that works well with Bun and TypeScript.

## Decision

Use **Drizzle ORM**.

## Alternatives Considered

**Prisma** - More mature, larger community, excellent DX for simple CRUD. However, Prisma's query engine is a separate binary that adds cold start overhead and has historically had compatibility friction with Bun. Schema is defined in a custom DSL (`.prisma` files) separate from TypeScript.

**Raw SQL (postgres.js)** - Maximum control but too much boilerplate for a project of this size.

## Consequences

- Schema is defined in TypeScript, making it the single source of truth and eliminating a DSL context switch.
- Queries are type-safe and close to SQL, which makes complex joins easier to reason about.
- Drizzle Studio provides a local DB browser during development.
- Migration workflow (`db:generate` + `db:migrate`) is explicit and straightforward.
- Less abstraction than Prisma means more verbose queries for some operations. Acceptable trade-off.
