# Entity Relationship Description

High-level description of the data model. No SQL; see Drizzle schemas in `apps/api/src/modules/*/` for the actual definitions.

## Entities

### user
Represents any person who can log in. Managed by better-auth. Has a `role` field that determines permissions (`mahasiswa`, `ketua_panitia`, `ormawa`, `fakultas`, `universitas`, `admin`).

### session
better-auth session record linked to a user. Stores token and expiry.

### event
An event created by a Ketua Panitia. Has a name, date, location, quota, type (`internal` / `external`), and a status (`draft`, `open`, `closed`). Linked to a proposal.

### proposal
A proposal submitted by a Ketua Panitia for an event. Has a status (`pending`, `approved`, `rejected`, `revision_requested`) and a `scope` (`ormawa`, `fakultas`, `universitas`) that determines how many approval levels are required.

### proposal_approval
A record of one approval action on a proposal. Linked to a proposal and a reviewer (user). Stores the decision (`approved`, `rejected`, `revision_requested`) and optional notes. One row per reviewer per submission round.

### division
A committee division within an event (e.g., "Acara", "Konsumsi"). Created by the Ketua Panitia. Has a name, description, and quota.

### committee_application
A student's application to join a division. Has a status (`pending`, `accepted`, `rejected`). Linked to a user and a division.

### registration
A student's registration as an event participant. Linked to a user and an event. Triggers ticket creation on success.

### ticket
Issued to a registered participant. Has a unique code for attendance verification and a status (`active`, `used`, `cancelled`). Linked to a registration.

### notification
An in-app notification for a user. Has a type (e.g., `proposal_approved`, `application_accepted`, `registration_success`), a message, a `read` flag, and an optional reference to the related entity.

## Key Relationships

- `user` → `event` (one user creates many events as Ketua Panitia)
- `event` → `proposal` (one event has one proposal)
- `proposal` → `proposal_approval` (one proposal has many approval records across levels)
- `event` → `division` (one event has many divisions)
- `division` → `committee_application` (one division has many applications)
- `user` → `committee_application` (one user applies to many divisions)
- `event` → `registration` (one event has many registrations)
- `registration` → `ticket` (one registration produces one ticket)
- `user` → `notification` (one user has many notifications)
