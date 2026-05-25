# API C4 Diagrams

Mermaid C4 diagrams for the owned API modules covered by the current backend checklist.

## Context

```mermaid
C4Context
title committee-hub API - System Context

Person(student, "Mahasiswa", "Registers for events, applies to committees, and tracks proposal/activity notifications.")
Person(chair, "Ketua Panitia", "Creates events, manages committee recruitment, and submits proposals.")
Person(reviewer, "Reviewer", "Ormawa, Fakultas, or Universitas approver who reviews proposals in order.")
Person(admin, "Admin Sistem", "Manages users, roles, configuration, and activity monitoring.")

System_Boundary(committeeHub, "committee-hub") {
  System(dashboard, "Dashboard SPA", "React + Vite frontend")
  System(api, "API", "ElysiaJS modular monolith")
}

System_Ext(google, "Google OAuth", "Identity provider used by Better Auth")
System_Ext(siakad, "SIAKAD API or Mock", "Student status validation source")

Rel(student, dashboard, "Uses")
Rel(chair, dashboard, "Uses")
Rel(reviewer, dashboard, "Uses")
Rel(admin, dashboard, "Uses")
Rel(dashboard, api, "Calls REST API", "HTTP")
Rel(api, google, "Delegates OAuth login", "HTTPS")
Rel(api, siakad, "Validates student status", "HTTPS or mock")
```

## Container

```mermaid
C4Container
title committee-hub API - Containers

Person(user, "Authenticated User", "Campus user with a role-backed session.")
Person(admin, "Admin Sistem", "System administrator.")
System_Ext(google, "Google OAuth", "OAuth provider")
System_Ext(siakad, "SIAKAD API or Mock", "Student validation")

System_Boundary(committeeHub, "committee-hub") {
  Container(dashboard, "Dashboard SPA", "React, Vite, TanStack Router, TanStack Query", "Browser app for event and committee workflows.")
  Container(api, "API Service", "Bun, ElysiaJS, Drizzle ORM, better-auth", "Modular monolith exposing REST endpoints and Better Auth handlers.")
  ContainerDb(db, "PostgreSQL", "PostgreSQL", "Application data, Better Auth tables, proposals, notifications, and admin activity logs.")
}

Rel(user, dashboard, "Uses")
Rel(admin, dashboard, "Uses")
Rel(dashboard, api, "Calls API and auth endpoints", "HTTP + cookies")
Rel(api, db, "Reads and writes", "Drizzle ORM")
Rel(api, google, "Runs OAuth flow through Better Auth", "HTTPS")
Rel(api, siakad, "Validates student status", "HTTPS or mock")
```

## Proposal Component

```mermaid
C4Component
title Proposal Module - Components

ContainerDb(db, "PostgreSQL", "Proposal, proposal approval, user, event, and notification tables")
Container(notificationModule, "Notification Module", "Elysia module", "Consumes in-process events and writes notification records.")

Container_Boundary(api, "API Service") {
  Component(proposalRoute, "Proposal Routes", "Elysia plugin", "Defines proposal HTTP endpoints and validates request shape.")
  Component(proposalService, "Proposal Service", "TypeScript service", "Coordinates proposal workflow and emits status-change events.")
  Component(proposalRepository, "Proposal Repository", "Drizzle repository", "Persists proposals, approval history, and workflow status transitions.")
  Component(workflowRules, "Approval Workflow Rules", "TypeScript helper", "Enforces required levels, review order, duplicate checks, and final status calculation.")
  Component(eventBus, "In-Process Event Emitter", "EventEmitter wrapper", "Publishes proposal status changes without direct cross-service calls.")
}

Rel(proposalRoute, proposalService, "Calls")
Rel(proposalService, proposalRepository, "Calls")
Rel(proposalRepository, workflowRules, "Applies")
Rel(proposalRepository, db, "Reads and writes", "Drizzle ORM")
Rel(proposalService, eventBus, "Emits proposal.statusChanged")
Rel(eventBus, notificationModule, "Notifies listener in-process")
Rel(notificationModule, db, "Writes notification rows", "Drizzle ORM")
```

## Admin Component

```mermaid
C4Component
title Admin Module - Components

ContainerDb(db, "PostgreSQL", "Better Auth user table, system config, and admin activity log")

Container_Boundary(api, "API Service") {
  Component(authContext, "Auth Context Middleware", "Elysia derive plugin", "Reads Better Auth session from request headers.")
  Component(adminGuard, "Admin Route Guard", "Elysia beforeHandle", "Requires an authenticated user with admin role.")
  Component(adminRoute, "Admin Routes", "Elysia plugin", "Exposes users, role management, system config, and activity endpoints.")
  Component(adminService, "Admin Service", "TypeScript service", "Coordinates admin workflows and delegates persistence.")
  Component(adminRepository, "Admin Repository", "Drizzle repository", "Manages user roles, system config, and admin activity log rows.")
  Component(betterAuth, "Better Auth", "Auth handler", "Owns Google OAuth, sessions, and user records.")
}

Rel(adminRoute, authContext, "Uses authSession")
Rel(adminRoute, adminGuard, "Runs before admin handlers")
Rel(adminRoute, adminService, "Calls")
Rel(adminService, adminRepository, "Calls")
Rel(adminRepository, db, "Reads and writes", "Drizzle ORM")
Rel(betterAuth, db, "Stores users and sessions", "Drizzle adapter")
```

## Relationship Notes

- Better Auth owns OAuth, session handling, and auth database tables. The admin module reads and updates the shared `user` table only for role management.
- Proposal status changes are published through the in-process event emitter. The notification module listens for those events and writes notification records.
- The API remains a modular monolith: routes call services, services call their own repositories, and cross-module side effects go through internal events.
- Admin activity monitoring uses `admin_activity_log` for auditable role and system configuration changes.
