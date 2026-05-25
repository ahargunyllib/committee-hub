# API Reference

Base URL: `import.meta.env.VITE_API_URL` (default `http://localhost:3000`).

**Tidak ada `/api` prefix.** Semua module di root.

## Auth

- Cookie httpOnly via better-auth. Setiap fetch wajib `credentials: "include"`.
- Frontend tidak perlu pasang `Authorization` header — semua via cookie.
- Endpoints better-auth di `/auth/*` (signin/signout/session, dikelola via `@better-auth/react` client).

## Error Envelope

Saat error, response body:

```json
{
  "error": {
    "code": "BAD_REQUEST|UNAUTHORIZED|NOT_FOUND|CONFLICT|FORBIDDEN|INTERNAL_SERVER_ERROR|NOT_IMPLEMENTED",
    "message": "Human-readable",
    "details": { "field": "reason" },
    "requestId": "req_xxx"
  }
}
```

Status code: 400/401/403/404/409/500/501.

**Success response**: raw JSON object/array (bukan envelope).

## Modules

### Better-auth (`/auth/*`)

Dipakai langsung via `authClient` (better-auth react), bukan via fetch wrapper kita. Lihat `02-layout-and-auth.md`.

Endpoints relevant:
- `POST /auth/sign-in/social` — Google OAuth.
- `POST /auth/sign-out`.
- `GET /auth/session` — Current session.

---

### Events (`/events`)

#### `GET /events`

Query params (optional):
- `type` — `"internal" | "external"`
- `status` — `"draft" | "open" | "closed"`
- `search` — string (matches name/location/id)

Response: `Event[]`.

#### `POST /events`

Body:
```ts
{
  createdById: string;      // sementara, idealnya derive dari session
  name: string;
  description?: string;
  location: string;
  date: string;             // ISO 8601
  quota: number;            // >= 1
  type: "internal" | "external";
}
```

Response: `Event` (status default `draft`).

#### `GET /events/:eventId`

Response: `Event | null`.

#### `PATCH /events/:eventId`

Body (partial):
```ts
{
  name?, description?, location?, date?, quota?, status?, type?
}
```

Response: `Event`.

#### `DELETE /events/:eventId`

Response: `{ deleted: true }`.

#### `POST /events/:eventId/registrations`

Body: `{ userId: string }`.
Response: `Registration` (+ ticket dibuat side-effect, lihat schema).

#### `GET /events/:eventId/registrations`

Response: `Registration[]`.

#### `POST /events/tickets/:ticketCode/verify`

No body. Response: `Ticket` (status berubah ke `used`).

---

### Proposals (`/proposals`)

#### `GET /proposals`

Query params (optional):
- `scope` — `"ormawa" | "fakultas" | "universitas"`
- `status` — `"pending" | "approved" | "rejected" | "revision_requested"`
- `submittedById` — string

Response: `Proposal[]`.

#### `POST /proposals`

Body:
```ts
{
  eventId: string;
  submittedById: string;
  title: string;
  description?: string;
  documentUrl?: string;
  scope: "ormawa" | "fakultas" | "universitas";
}
```

Response: `Proposal` (status `pending`, round 1).

#### `GET /proposals/:proposalId`

Response: `Proposal | null`.

#### `PATCH /proposals/:proposalId`

Body (partial): `{ title?, description?, documentUrl?, scope? }`. Response: `Proposal`.

#### `POST /proposals/:proposalId/submit`

No body. Resubmit — bump `submissionRound`, status → `pending`, `submittedAt` updated. Response: `Proposal`.

#### `POST /proposals/:proposalId/reviews`

Body:
```ts
{
  reviewerId: string;
  level: "ormawa" | "fakultas" | "universitas";
  decision: "approved" | "rejected" | "revision_requested";
  notes?: string;
}
```

Response: `ProposalApproval`.

**State transition** (server-side, untuk current round):
- `rejected` → proposal `rejected`.
- `revision_requested` → proposal `revision_requested`.
- `approved`:
  - Kalau approvals for round ini cover all scope levels → proposal `approved`.
  - Else → proposal stays `pending`, level berikutnya jadi active.

Reviewer hanya bisa act kalau role match active level untuk current round.

#### `GET /proposals/:proposalId/approvals`

Response: `ProposalApproval[]`.

---

### Committee (`/committee`)

#### `GET /committee/events/:eventId/divisions`

Response: `Division[]`.

#### `POST /committee/events/:eventId/divisions`

Body:
```ts
{
  name: string;
  quota: number;      // >= 1
  description?: string;
}
```

Response: `Division`.

#### `PATCH /committee/divisions/:divisionId`

Body: `{ name?, quota?, description? }`. Response: `Division`.

#### `POST /committee/divisions/:divisionId/applications`

Body:
```ts
{
  userId: string;
  motivation?: string;     // >= 8 chars rekomendasi
}
```

Response: `CommitteeApplication`.

#### `GET /committee/divisions/:divisionId/applications`

Response: `CommitteeApplication[]`.

#### `PATCH /committee/applications/:applicationId/review`

Body:
```ts
{
  reviewerId: string;
  status: "accepted" | "rejected";
}
```

Response: `CommitteeApplication`.

---

### Notifications (`/notifications`)

#### `GET /notifications`

Query params:
- `userId` (required) — typically current user id.
- `read` (optional) — `"true" | "false"`.

Response: `Notification[]`.

#### `PATCH /notifications/:notificationId/read`

Body: `{ userId: string }`. Response: `Notification`.

#### `PATCH /notifications/read-all`

Body: `{ userId: string }`. Response: `void`.

---

### Admin (`/admin`)

#### `GET /admin/users`

Response: `User[]`.

#### `PATCH /admin/users/:userId/role`

Body: `{ role: UserRole }`. Response: `User`.

#### `GET /admin/config`

Response: `SystemConfig[]`.

#### `PUT /admin/config/:key`

Body:
```ts
{
  value: string;
  valueType: "string" | "number" | "boolean" | "json";
  description?: string;
  updatedById?: string;
}
```

Response: `SystemConfig`.

#### `GET /admin/activity`

Response: `ActivityEntry[]` (last 8 entries by default).

---

## Type Definitions (mirror DB)

```ts
// shared/lib/types.ts atau features/<x>/types/<x>.ts

export type UserRole =
  | "mahasiswa"
  | "ketua_panitia"
  | "ormawa"
  | "fakultas"
  | "universitas"
  | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type EventStatus = "draft" | "open" | "closed";
export type EventType = "internal" | "external";

export type Event = {
  id: string;
  createdById: string;
  name: string;
  description: string | null;
  date: string;
  location: string;
  quota: number;
  type: EventType;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
};

export type Registration = {
  id: string;
  eventId: string;
  userId: string;
  createdAt: string;
};

export type TicketStatus = "active" | "used" | "cancelled";

export type Ticket = {
  id: string;
  registrationId: string;
  code: string;
  status: TicketStatus;
  usedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProposalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revision_requested";

export type ProposalScope = "ormawa" | "fakultas" | "universitas";

export type Proposal = {
  id: string;
  eventId: string;
  submittedById: string;
  title: string;
  description: string | null;
  documentUrl: string | null;
  status: ProposalStatus;
  scope: ProposalScope;
  submissionRound: number;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ProposalDecision = "approved" | "rejected" | "revision_requested";

export type ProposalApproval = {
  id: string;
  proposalId: string;
  reviewerId: string;
  level: ProposalScope;
  decision: ProposalDecision;
  notes: string | null;
  submissionRound: number;
  createdAt: string;
};

export type Division = {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  quota: number;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export type CommitteeApplication = {
  id: string;
  divisionId: string;
  userId: string;
  status: ApplicationStatus;
  motivation: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationType =
  | "proposal_approved"
  | "proposal_rejected"
  | "proposal_revision_requested"
  | "application_accepted"
  | "application_rejected"
  | "registration_success";

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  referenceType: string | null;
  referenceId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type ConfigValueType = "string" | "number" | "boolean" | "json";

export type SystemConfig = {
  id: string;
  key: string;
  value: string;
  valueType: ConfigValueType;
  description: string | null;
  updatedById: string | null;
  createdAt: string;
  updatedAt: string;
};
```

## Catatan Penting

- Beberapa POST endpoint butuh `userId` / `submittedById` / `reviewerId` / `createdById` di body. **Ambil dari `session.user.id`** via better-auth client; jangan trust input dari form.
- Idealnya backend derive identity dari auth session — kalau ada bandwidth, follow-up task untuk refactor di apps/api supaya endpoint tidak butuh userId di body. Out of scope untuk plan ini.
- Notifications count untuk sidebar: panggil `GET /notifications?userId=X&read=false` dengan `refetchInterval: 30_000` atau invalidate setelah mutation lain.
- Ticket code format default: `CMTHB-XXXX-XXXX` (prefix dari SystemConfig `ticket.code_prefix`).
