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
    title Component Diagram: Event Module

    Container(dashboard, "Frontend Dashboard", "React", "Client application")
    ContainerDb(db, "PostgreSQL Database", "Drizzle Schema", "Shared database")

    Container_Boundary(api, "API Application (apps/api)") {
        
        Boundary(event_mod, "Event Module") {
            Component(event_route, "Event Routes", "ElysiaJS", "Endpoints for event CRUD, registration, and ticketing.")
            Component(event_service, "Event Service", "TypeScript", "Business rules, event limits, and logical routing.")
            Component(event_repo, "Event Repository", "Drizzle ORM", "ACID transactions for event, registration, and ticket tables.")
        }

        Component(notify_mod, "Notification Module", "Node EventEmitter", "Background listener.")
    }

    %% External Interactions
    Rel(dashboard, event_route, "Registers for event", "JSON/HTTPS")

    %% Internal Event Flow
    Rel(event_route, event_service, "Calls")
    Rel(event_service, event_repo, "Calls")
    Rel(event_repo, db, "Reads/Writes")

    %% In-Process Side Effects (Notifications)
    Rel(event_service, notify_mod, "Emits 'event.registrationCreated'")
    UpdateRelStyle(event_service, notify_mod, $lineStyle="dashed")
```

```mermaid
C4Component
    title Component Diagram: Committee Module

    Container(dashboard, "Frontend Dashboard", "React", "Client application")
    ContainerDb(db, "PostgreSQL Database", "Drizzle Schema", "Shared database")

    Container_Boundary(api, "API Application (apps/api)") {

        Boundary(com_mod, "Committee Module") {
            Component(com_route, "Committee Routes", "ElysiaJS", "Endpoints for division creation, applications, and reviews.")
            Component(com_service, "Committee Service", "TypeScript", "Business rules for division quotas and application states.")
            Component(com_repo, "Committee Repository", "Drizzle ORM", "ACID transactions for division and application tables.")
        }

        Component(notify_mod, "Notification Module", "Node EventEmitter", "Background listener.")
    }

    %% External Interactions
    Rel(dashboard, com_route, "Applies to division / Reviews applicants", "JSON/HTTPS")

    %% Internal Committee Flow
    Rel(com_route, com_service, "Calls")
    Rel(com_service, com_repo, "Calls")
    Rel(com_repo, db, "Reads/Writes")

    %% In-Process Side Effects (Notifications)
    Rel(com_service, notify_mod, "Emits 'committee.applicationReviewed'")
    UpdateRelStyle(com_service, notify_mod, $lineStyle="dashed")
```

---

## Level 4: Code Diagrams (UML Class Structure)

Level 4 defines the internal code structure of the components. For a TypeScript-based modular API, this translates to the interfaces, data models, services, and repositories that execute the business logic.

### 4a. Event Module Code Structure

This class diagram illustrates the implementation details of the `Event` module, highlighting the specific methods that handle data transformation and ACID transactions.

```mermaid
classDiagram
    direction TB

    class EventRoute {
        <<Elysia Plugin>>
        +POST /events/
        +PUT /events/:id
        +POST /events/:id/register
    }

    class EventService {
        <<Service Layer>>
        +createEvent(input)
        +updateEvent(eventId, input)
        +registerParticipant(eventId, userId)
    }

    class EventRepository {
        <<Drizzle Access Data>>
        +createEvent(input): Event
        +updateEvent(eventId, input): Event
        +createRegistration(eventId, userId): Registration
    }

    class EventModel {
        <<Drizzle Schema>>
        +String id
        +String name
        +Date date
        +Number quota
        +String status
    }

    class RegistrationModel {
        <<Drizzle Schema>>
        +String id
        +String eventId
        +String userId
    }

    EventRoute --> EventService : validates & routes to
    EventService --> EventRepository : applies business rules & calls
    EventRepository ..> EventModel : manages
    EventRepository ..> RegistrationModel : manages & queries
```

### 4b. Committee Module Code Structure

This class diagram outlines the Committee module, displaying the specific methods we implemented to safely handle concurrent division updates and HR application reviews.

```mermaid
classDiagram
    direction TB

    class CommitteeRoute {
        <<Elysia Plugin>>
        +POST /committee/divisions
        +PUT /committee/divisions/:id
        +POST /committee/applications
        +POST /committee/applications/:id/review
    }

    class CommitteeService {
        <<Service Layer>>
        +createDivision(input)
        +updateDivision(divisionId, input)
        +createApplication(input)
        +reviewApplication(applicationId, input)
    }

    class CommitteeRepository {
        <<Drizzle Access Data>>
        +createDivision(input): Division
        +updateDivision(divisionId, input): Division
        +createApplication(input): CommitteeApplication
        +reviewApplication(applicationId, input): CommitteeApplication
    }

    class DivisionModel {
        <<Drizzle Schema>>
        +String id
        +String name
        +Number quota
    }

    class CommitteeApplicationModel {
        <<Drizzle Schema>>
        +String id
        +String divisionId
        +String userId
        +String status
    }

    CommitteeRoute --> CommitteeService : validates & routes to
    CommitteeService --> CommitteeRepository : applies business rules & calls
    CommitteeRepository ..> DivisionModel : manages
    CommitteeRepository ..> CommitteeApplicationModel : manages & queries
```


