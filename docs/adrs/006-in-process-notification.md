# ADR 006 - In-Process Event-Driven Notifications

**Status:** Accepted
**Date:** 2026-02

## Context

Notifications need to be sent when certain events occur (proposal approved, application accepted, registration successful). We needed to decide how modules communicate these events to the notification module.

## Decision

Use an **in-process event emitter** (Node.js/Bun `EventEmitter` or equivalent). When a module completes an action that should trigger a notification, it emits an internal event. The notification module listens to these events and writes notification records to the database.

## Alternatives Considered

**Redis pub/sub** - Decouples producers and consumers across processes, useful for microservices. Introduces an external dependency (Redis) and operational overhead that is not justified in a monolith.

**Direct service calls** - Notification module called directly from other services. Creates tight coupling between modules and risks notification failures blocking core business logic.

## Consequences

- No external dependencies needed for notifications.
- Notification failures (e.g., DB write error) do not block the triggering operation; event emission is fire-and-forget.
- Only works within a single process. If the API is ever scaled horizontally or split into services, this will need to be replaced with a proper message broker.
- Notification delivery is not guaranteed if the process crashes between the event emission and the DB write. Acceptable for the current scope.
