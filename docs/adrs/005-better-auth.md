# ADR 005 - better-auth for Authentication

**Status:** Accepted
**Date:** 2026-02

## Context

We needed an auth solution that handles sessions, JWT, and user management with minimal custom code, and that integrates cleanly with ElysiaJS and a React frontend.

## Decision

Use **better-auth**.

The server instance lives in `apps/api/src/lib/auth.ts` and is mounted as an Elysia plugin. The client instance lives in `apps/dashboard/src/lib/auth.ts` using `createAuthClient()` pointed at the API URL.

No separate `packages/auth` workspace is created -- the two-app structure does not justify the extra indirection.

## Alternatives Considered

**Manual JWT implementation** - Full control but significant boilerplate: token issuance, refresh, revocation, session storage, and security considerations all need to be handled manually.

**Lucia** - Solid library but lower-level than better-auth; requires more wiring.

**NextAuth / Auth.js** - Designed primarily for Next.js; not a natural fit for a standalone ElysiaJS API.

## Consequences

- Session management, token refresh, and basic user CRUD are handled out of the box.
- The better-auth client gives the dashboard type-safe access to auth state and actions.
- SIAKAD validation is implemented as a post-login hook in the auth module, not as a built-in better-auth feature.
- better-auth stores session data in the PostgreSQL database alongside application data.
