# ADR 002 - Modular Monolith over Microservices

**Status:** Accepted
**Date:** 2026-02

## Context

The system has several distinct capabilities: auth, committee management, proposal workflow, event management, and notifications. We needed to decide whether to split these into separate services or keep them together.

## Decision

Use a **modular monolith**: one deployable unit, organized into clearly bounded modules with a consistent internal structure.

## Alternatives Considered

**Microservices** - Each module as an independent service with its own database and deployment. Offers per-service scaling and fault isolation, but requires service discovery, inter-service communication (HTTP or message broker), distributed tracing, and significantly more infra work. Overhead is not justified for a 3-person academic project.

## Consequences

- Single deployment is simpler to manage and debug.
- Shared PostgreSQL database with foreign keys across modules -- simpler queries, no cross-service data consistency issues.
- If load requires it, individual modules can be extracted into separate services later. The `route → service → repository` structure is designed to make this feasible.
- Modules must respect their boundaries: a service in one module should not directly call a repository from another module.
