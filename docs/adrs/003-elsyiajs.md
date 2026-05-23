# ADR 003 - ElysiaJS as API Framework

**Status:** Accepted
**Date:** 2026-02

## Context

We needed an HTTP framework for the Bun-based API that supports TypeScript well and minimizes boilerplate for common patterns.

## Decision

Use **ElysiaJS**.

## Alternatives Considered

**Hono** - Lightweight and well-regarded, but requires a separate library for OpenAPI/Swagger documentation.

**Express** - Mature ecosystem but no first-class TypeScript support, no built-in validation, and slower on Bun than native alternatives.

## Consequences

- Built-in Swagger UI via the `@elysiajs/swagger` plugin means documentation is always in sync with the implementation.
- ElysiaJS Eden provides an optional type-safe client, useful if we ever want end-to-end types between API and dashboard.
- Type-safe request validation via ElysiaJS's schema system (built on TypeBox) without needing a separate validation library in route handlers.
- Smaller community than Express, but documentation is sufficient for our use case.
