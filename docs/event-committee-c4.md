# C4 Architecture Documentation: Event & Committee Modules

This document provides a comprehensive structural overview of the `committee-hub` platform, specifically focusing on the newly implemented **Event** and **Committee** modules. The system architecture is modeled using the C4 framework (Context, Containers, and Components) to translate complex codebase boundaries into clear, navigable system designs.

---

## Level 1: System Context Diagram

The System Context diagram provides a high-level abstraction of how different human actors interact with the `committee-hub` boundary and establishes its core operational relationship with critical institutional infrastructure.

```mermaid
C4Context
    title System Context: Event & Committee Focus

    Person(mhs, "Mahasiswa", "Registers as an event participant or applies to join a committee division.")
    Person(kp, "Ketua Panitia", "Creates events, manages divisions, and handles applicant selection.")
    
    System(hub, "committee-hub", "Centralized platform for campus event and HR management.")
    System_Ext(siakad, "SIAKAD API", "Validates student status and identity (Mocked in dev).")

    Rel(mhs, hub, "Views events, registers for tickets, applies for divisions")
    Rel(kp, hub, "Creates events, sets quotas, reviews committee applicants")
    Rel(hub, siakad, "Validates student session data")
```

## Level 2: Container Diagram

The Container diagram focuses on the high-level technological breakdown of the platform, highlighting how the application logic is partitioned across runtime environments.

```mermaid
C4Container
    title Container Diagram: committee-hub

    Person(mhs, "Mahasiswa", "General student user")
    Person(kp, "Ketua Panitia", "Event head user")

    System_Boundary(hub, "committee-hub") {
        Container(dashboard, "Frontend Dashboard", "React, Vite, TanStack", "Provides the UI for event discovery, ticketing, and applicant review.")
        Container(api, "API Application", "Bun, ElysiaJS", "Modular monolith hosting Event, Committee, Proposal, and Auth logic.")
        ContainerDb(db, "PostgreSQL Database", "PostgreSQL", "Shared primary database storing all system records.")
    }

    Rel(mhs, dashboard, "Visits", "HTTPS")
    Rel(kp, dashboard, "Visits", "HTTPS")
    Rel(dashboard, api, "Makes API calls", "JSON/HTTPS")
    Rel(api, db, "Reads/Writes data", "TCP/SQL")
```

## Level 3: Component Diagram

The Component diagram dives directly into the internal architectural patterns of the API Application (apps/api), visualizing the layered structural approach (Routes, Services, and Repositories) used to construct both the Event and Committee domains.

```mermaid
C4Component
    title Component Diagram: Event & Committee Modules

    Container(dashboard, "Frontend Dashboard", "React", "Client application making HTTP requests")

    Container_Boundary(api, "API Application (apps/api)") {
        
        Boundary(event_mod, "Event Module") {
            Component(event_route, "Event Routes", "ElysiaJS", "HTTP endpoints for event CRUD, participant registration, and ticketing.")
            Component(event_service, "Event Service", "TypeScript", "Business rules for event limits, ticket issuance, and registration logic.")
            Component(event_repo, "Event Repository", "Drizzle ORM", "Executes queries against event, registration, and ticket tables.")
        }

        Boundary(com_mod, "Committee Module") {
            Component(com_route, "Committee Routes", "ElysiaJS", "HTTP endpoints for division creation, applicant submissions, and selection.")
            Component(com_service, "Committee Service", "TypeScript", "Business rules for division quotas and application state transitions.")
            Component(com_repo, "Committee Repository", "Drizzle ORM", "Executes queries against division and committee_application tables.")
        }

        Component(notify_mod, "Notification Module", "Node EventEmitter", "In-process listener for system events.")
    }

    ContainerDb(db, "PostgreSQL Database", "Drizzle Schema", "Shared DB with cross-module foreign keys.")

    %% External Interactions
    Rel(dashboard, event_route, "Registers for event", "JSON/HTTPS")
    Rel(dashboard, com_route, "Applies to division / Reviews applicants", "JSON/HTTPS")

    %% Internal Event Flow
    Rel(event_route, event_service, "Calls")
    Rel(event_service, event_repo, "Calls")
    Rel(event_repo, db, "Reads/Writes (event, registration, ticket)")

    %% Internal Committee Flow
    Rel(com_route, com_service, "Calls")
    Rel(com_service, com_repo, "Calls")
    Rel(com_repo, db, "Reads/Writes (division, committee_application)")

    %% In-Process Side Effects (Notifications)
    Rel(event_service, notify_mod, "Emits 'registration.success'")
    Rel(com_service, notify_mod, "Emits 'application.accepted' / 'application.rejected'")
    
    %% Implicit DB rule representation
    UpdateRelStyle(event_service, notify_mod, $lineStyle="dashed")
    UpdateRelStyle(com_service, notify_mod, $lineStyle="dashed")
```



