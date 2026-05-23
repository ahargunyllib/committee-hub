# Engineering Principles

This document defines the design principles and patterns used in this project.
It is intended for both human contributors and AI coding agents.

---

## Core Principles

**Composition over inheritance.**
Combine small, focused functions instead of building class hierarchies. New behavior = new combination, not new subclass.

**Make illegal states unrepresentable.**
Use discriminated unions to model state. If a state is invalid, the type system should prevent it from existing.

```typescript
// Do this
type Order =
  | { status: "pending" }
  | { status: "paid"; paidAt: Date; paymentId: string }
  | { status: "cancelled"; reason: string };

// Not this
type Order = {
  status: string;
  paidAt: Date | null;
  paymentId: string | null;
  reason: string | null;
};
```

**Parse, don't validate.**
Transform untyped input into a type that guarantees validity. If parsing succeeds, downstream code can trust the data without re-checking.

```typescript
// Do this: parse into a branded/narrowed type
function parseEmail(input: string): Email | null { ... }
function sendEmail(to: Email) { ... } // caller must parse first

// Not this: validate then hope
function sendEmail(to: string) {
  if (!isValidEmail(to)) throw new Error("invalid");
  ...
}
```

**Proportional architecture.**
Add layers and abstractions only when complexity justifies them. Simple CRUD does not need domain layers, aggregates, or event buses. Do not cargo-cult patterns.

**Fail fast, return early.**
Check preconditions at the top. Reject invalid input before doing real work.

**Single source of truth.**
Do not keep redundant state. Derive values when possible instead of syncing parallel stores.

**Colocation.**
Keep code that changes together in the same place. Group by feature/domain, not by technical role.

```
# Prefer this
src/order/
  order.controller.ts
  order.service.ts
  order.types.ts
  order.test.ts

# Over this
src/controllers/order.ts
src/services/order.ts
src/types/order.ts
src/tests/order.test.ts
```

---

## Code Organization Roles

Not every project needs all of these. Add roles as complexity demands.

| Role | Responsibility | Knows about |
|---|---|---|
| **Controller / Handler** | Parse input, call service, format response | HTTP, request/response shape |
| **Service** | Orchestrate business flow across multiple dependencies | Domain, repositories, gateways |
| **Domain** | Pure business rules and types, zero external imports | Nothing external |
| **Repository** | Data access abstraction | Database schema |
| **Gateway / Adapter** | Wrap external APIs into internal interfaces | Third-party API |
| **Middleware** | Cross-cutting concerns (auth, logging, rate limit) | Request lifecycle |
| **Infrastructure** | Concrete setup: DB connections, queue clients, config | External systems |

**Decision guide:**
- Does it know about HTTP? -> Controller
- Does it orchestrate multiple steps? -> Service
- Is it a pure business rule with no dependencies? -> Domain
- Does it read/write to a database? -> Repository
- Does it call an external API? -> Gateway
- Is it a cross-cutting concern? -> Middleware

### API Layering in committee-hub

The API uses a modular monolith. Feature modules normally expose `route`,
`service`, `repository`, and `schema` files, but those layers still need to
earn their keep:

- **Route handlers** parse HTTP input, call one service method, and format the
  HTTP response. They should not contain business rules or Drizzle queries.
- **Services** own business policy and orchestration: status transitions,
  role/permission decisions, multi-step workflows, transactions coordinated by
  a repository method, and event emission after a successful write.
- **Repositories** own persistence details: Drizzle queries, joins, FK-backed
  existence checks, uniqueness conflicts, and mapping database failures into
  domain/application errors.
- A service that only forwards to a repository is acceptable in an initial
  scaffold, but when implementation lands it should either gain real business
  logic or be collapsed for genuinely simple CRUD.

Module boundaries are dependency boundaries, not database walls:

- A service must not call another module's service or repository directly.
- A repository may read shared/reference tables when the check is part of its
  persistence invariant. Example: `event.repository` may check `userTable`
  before inserting `event.created_by_id`.
- Use database foreign keys for hard integrity, pre-checks for clearer user
  errors, and internal events for post-success side effects.
- Better Auth is infrastructure mounted from `apps/api/src/lib/auth.ts`; its
  `user` table schema lives under `apps/api/src/db/auth.schema.ts`, not as a
  normal business module.

---

## Patterns to Follow

**Use discriminated unions for state modeling.**
Always include a `type` or `status` field as the discriminant.

**Use `pipe` / sequential transformation for data processing.**
When data flows through multiple transformations, compose them as a pipeline rather than nesting calls.

**Prefer functions over classes.**
Use classes only when you need encapsulated mutable state. For everything else, plain functions and object literals are simpler.

**Dependency injection via function arguments.**
Pass dependencies explicitly. No global singletons, no DI frameworks.

```typescript
function createOrderService(deps: {
  db: Database;
  payment: PaymentGateway;
}) {
  return {
    async createOrder(input: OrderInput) { ... },
  };
}
```

**Errors as values, not exceptions.**
Use Result types or union returns for expected failure cases. Reserve exceptions for truly unexpected errors.

```typescript
type CreateOrderResult =
  | { ok: true; order: Order }
  | { ok: false; reason: "out_of_stock" | "payment_failed" };
```

For expected async failures, use the local `tryCatch` helper instead of
Promise chains. Application code should use `async/await`; do not use
`.then()`, `.catch()`, or `.finally()`.

```typescript
import { tryCatch } from "../lib/try-catch";

const { data, error } = await tryCatch(repository.createOrder(input));

if (error) {
  logger.warn({ error }, "Failed to create order");
  return { ok: false, reason: "create_failed" };
}

return { ok: true, order: data };
```

---

## Patterns to Avoid

**Thin wrappers that add no logic.**
If a class/function just forwards calls to another without adding caching, validation, transformation, or business rules, inline it. Abstraction has a cost; earn it.

**Premature DRY.**
Do not extract shared code until you have three concrete examples. Two similar-looking functions that serve different business purposes are not duplication. Wait for the real pattern to emerge.

**Premature optimization.**
Measure first. Optimize the actual bottleneck, not the assumed one.

**Deeply nested inheritance hierarchies.**
Favor composition. If you need shared behavior, extract a function, not a base class.

**Stringly-typed data.**
Do not pass raw strings for structured concepts (emails, IDs, statuses). Use branded types or enums.

---

## Naming Conventions

- **Files**: `kebab-case.ts`
- **Functions/variables**: `camelCase`
- **Types/interfaces**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE` for true constants, `camelCase` for config
- **Booleans**: prefix with `is`, `has`, `can`, `should` (e.g. `isActive`, `canCancel`)
- Function names: verb-first (e.g. `createOrder`, `parseEmail`, `calculateTotal`)
- Avoid generic names: `data`, `info`, `item`, `result`, `temp`, `handler`. Be specific.
