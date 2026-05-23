# Product Requirements Document

**Project:** committee-hub
**Version:** 1.0
**Status:** Draft

## Problem

Campus event management is fragmented across spreadsheets, Google Forms, email, and chat apps. There is no single place to recruit committee members, track proposal approvals, manage events, or issue tickets. This causes data duplication, slow approval chains, and lack of visibility into event status.

## Users and Roles

| Role | Description |
|---|---|
| Mahasiswa | General student. Registers as event participant or applies to join a committee. |
| Ketua Panitia | Event head. Creates events, manages divisions, submits proposals. |
| Pengurus Ormawa | First approval level for proposals. |
| Pihak Fakultas | Second approval level for proposals. |
| Pihak Universitas | Final approval level for university-scale events. |
| Admin Sistem | System administrator. Manages users, roles, and platform config. |

## Features

### Auth
- Login and registration
- Student status validation via SIAKAD (real-time; mock in dev)
- Role-based access control
- Session management via better-auth

### Committee Management
- Ketua Panitia creates divisions for an event and opens recruitment
- Mahasiswa applies to a division
- Ketua Panitia reviews and accepts or rejects applicants
- Accepted members are assigned to the division

### Proposal Workflow
- Ketua Panitia submits a proposal for an event
- Approval flows sequentially: Ormawa → Fakultas → Universitas (universitas only for university-scale events)
- Each reviewer can approve, reject, or request revision
- Ketua Panitia can revise and resubmit after a revision request
- Status is visible to all involved parties in real-time

### Event and Ticketing
- Ketua Panitia creates and manages events (name, date, quota, type)
- Events become visible to students after proposal is approved
- Mahasiswa registers as a participant and receives a ticket
- Ticket includes a unique code for attendance verification

### Notifications
- Automatic notifications triggered by:
  - Proposal status change (approved / rejected / revision requested)
  - Committee application status change (accepted / rejected)
  - Successful event registration
- Delivered in-app; visible in notification feed

### Admin
- User and role management
- System configuration and master data
- Activity monitoring

## Non-Functional Requirements

| Category | Requirement |
|---|---|
| Availability | Event registration must handle traffic spikes (e.g., popular events) |
| Integration | Auth must validate against SIAKAD; mock available for development |
| Loose Coupling | Notification service must not block core flows (login, registration) |
| Auditability | Proposal approval history must be fully traceable |

## Out of Scope (v1)

- Payment and paid ticketing
- Mobile app
- Analytics and reporting dashboard
- Real-time chat between committee members
