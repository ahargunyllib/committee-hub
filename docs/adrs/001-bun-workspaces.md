# ADR 001 - Bun Workspaces for Monorepo

**Status:** Accepted
**Date:** 2026-02

## Context

The project has two apps (`api` and `dashboard`) that share no code but benefit from being in the same repository: unified versioning, easier cross-app refactoring, and a single place for documentation and CI.

We needed a way to manage multiple packages in one repo.

## Decision

Use **Bun workspaces** (native) without Turborepo or Nx.

## Alternatives Considered

**Turborepo** - Adds task caching and parallel execution but introduces extra config and tooling overhead. Valuable for larger teams and more complex pipelines; not justified for a 3-person project with two apps.

**Separate repos** - Simpler per-app but loses the benefits of colocation (shared context, unified docs, easier review of cross-app changes).

## Consequences

- No build caching out of the box. Acceptable given small team and fast Bun build times.
- Simple `package.json` workspaces config at root is all that's needed.
- If the project grows significantly, Turborepo can be layered on top without restructuring.
