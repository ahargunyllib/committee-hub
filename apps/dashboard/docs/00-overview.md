# 00 — Overview

## Product

`committee-hub` adalah dashboard manajemen event & committee kampus. Fitur utama:

- Pembuatan event dengan ticketing (registrasi + ticket code).
- Proposal approval bertingkat (Ormawa → Fakultas → Universitas).
- Recruitment committee per division dengan alur application/accept/reject.
- Notification feed in-app.
- Admin panel: user role management + system config + activity audit.

## Roles (6)

| Role id | Indonesian | Function |
|---|---|---|
| `mahasiswa` | Mahasiswa | Daftar event, apply committee |
| `ketua_panitia` | Ketua Panitia | Buat event/division, submit proposal, review applicants |
| `pengurus_ormawa` | Pengurus Ormawa | Proposal approver level 1 |
| `pihak_fakultas` | Pihak Fakultas | Proposal approver level 2 |
| `pihak_universitas` | Pihak Universitas | Proposal approver level 3 |
| `admin_sistem` | Admin Sistem | User/role management, system config, audit |

New Google sign-in → default `mahasiswa`.

> **Catatan**: API `userRole` enum saat ini pakai `["mahasiswa","ketua_panitia","ormawa","fakultas","universitas","admin"]` (lihat `apps/api/src/db/auth.schema.ts`). Frontend tetap pakai 6 role id sesuai handoff (`pengurus_ormawa`, `pihak_fakultas`, `pihak_universitas`, `admin_sistem`). **Pilih salah satu — selaraskan**. Rekomendasi: pakai nama dari API (`ormawa`, `fakultas`, `universitas`, `admin`) untuk konsistensi dengan DB schema, dan label UI tetap "Pengurus Ormawa", "Pihak Fakultas", dst. Kalau mau pakai nama lengkap handoff, perlu update enum di DB schema dulu.

## Stack (existing)

**Dashboard** (`apps/dashboard`):
- Vite 8 + React 19.2 + TypeScript
- TanStack Router 1.170 (file-based, auto code-splitting)
- React Compiler (Babel plugin)
- Tailwind CSS 4.3 + tw-animate-css + shadcn (style: `radix-mira`)
- `@hugeicons/react` untuk icons
- Class Variance Authority + clsx + tailwind-merge

**Belum ada (perlu install di Phase 0):**
- `@tanstack/react-query` + `@tanstack/react-query-devtools`
- `@tanstack/react-form`
- `zod`
- `better-auth`
- `sonner` (toast)
- `zustand`

**Backend** (`apps/api`):
- ElysiaJS + Drizzle ORM + PostgreSQL
- better-auth (Google OAuth, role di custom field)
- Modules: committee, proposal, event, notification, admin
- Endpoint di root path (tanpa `/api`). Lihat `api-reference.md`.

## Folder Structure (target)

Mirror `tedx-2026/apps/dashboard`:

```
apps/dashboard/src/
├── main.tsx                       # QueryClientProvider + TooltipProvider + Toaster
├── routeTree.gen.ts               # auto-generated
├── index.css                      # + status color tokens (Phase 2)
├── routes/
│   ├── __root.tsx                 # context: { queryClient }
│   ├── index.tsx                  # redirect → /dashboard/overview
│   ├── auth/
│   │   └── login.tsx              # Login screen
│   └── dashboard/
│       ├── route.tsx              # Layout (sidebar + topbar + auth guard)
│       ├── overview.tsx
│       ├── events.tsx
│       ├── proposals.tsx
│       ├── committee.tsx
│       ├── notifications.tsx
│       └── admin.tsx              # beforeLoad: redirect kalau bukan admin
├── components/
│   ├── ui/                        # shadcn primitives (auto via CLI)
│   └── shared/                    # StatusBadge, RoleBadge, EmptyState, PageHeader, StatTile
├── features/
│   ├── auth/                      # login form, google button
│   ├── overview/                  # stat tiles, workflow strip, upcoming, work queue
│   ├── event/
│   │   ├── components/
│   │   ├── containers/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── types/
│   │   └── utils/
│   ├── proposal/
│   ├── committee/
│   ├── notification/
│   └── admin/
└── shared/
    ├── components/                # app-logo, user-menu, sidebar-nav, topbar
    ├── hooks/                     # use-debounce, use-current-user
    └── lib/
        ├── api.ts                 # fetch wrapper + ApiError
        ├── auth.ts                # better-auth client
        ├── query-client.ts
        ├── permissions.ts
        ├── format.ts              # date / relative-time
        └── string.ts              # initials, hashHue
```

## Pola Container → Component → Hook

Setiap feature ikut pola `tedx-2026`:

- **Container** (`features/<x>/containers/`) — Baca state (Zustand filter store), panggil TanStack Query, render component dengan loading/error states.
- **Component** (`features/<x>/components/`) — Pure presentational; terima data via props.
- **Hook** (`features/<x>/hooks/`) — Forms (TanStack Form + Zod + mutation + cache invalidation + toast).
- **Store** (`features/<x>/stores/`) — Zustand filter/UI state.
- **Types** (`features/<x>/types/`) — TypeScript types match API response.
- **Utils** (`features/<x>/utils/`) — Formatters, variant mappers (mis. `statusToVariant`).

## Authentication Flow

1. User buka `/` → redirect ke `/dashboard/overview`.
2. `routes/dashboard/route.tsx` `beforeLoad` cek `authClient.getSession()`.
3. Kalau tidak ada session → redirect `/auth/login`.
4. Login screen → klik "Continue with Google" → `authClient.signIn.social({ provider: "google", callbackURL: "/dashboard/overview" })`.
5. Better-auth set httpOnly cookie. Semua API request berikutnya bawa cookie via `credentials: "include"`.
6. `useSession()` (dari better-auth client) untuk akses user di komponen.

## API Integration

- Base URL: `import.meta.env.VITE_API_URL` (default `http://localhost:3000`).
- Semua endpoint di root path (`/events`, `/proposals`, `/committee/...`, `/notifications`, `/admin/...`, `/auth/...`).
- Setiap fetch: `credentials: "include"`.
- Sukses → raw JSON (Drizzle model langsung, bukan envelope).
- Error → envelope `{error:{code,message,details?,requestId}}` → throw `ApiError`.

Detail per endpoint: lihat **api-reference.md**.

## Roadmap Phases

| Phase | Goal | Commit |
|---|---|---|
| 0 | Install deps + shadcn primitives | `chore(dashboard): install shadcn primitives + query/form deps` |
| 1 | Shared lib (api/auth/query/permissions/format/string) | `feat(dashboard): add api client, auth client, query client, permissions, formatters` |
| 2 | Status badge color tokens | `feat(dashboard): add status badge color tokens` |
| 3 | Protected dashboard layout (sidebar + topbar) | `feat(dashboard): add protected dashboard layout with sidebar + topbar` |
| 4 | Login screen | `feat(dashboard): add login screen` |
| 5 | Overview screen | `feat(dashboard): add overview screen` |
| 6 | Events screen | `feat(dashboard): add events screen with create + verify ticket` |
| 7 | Proposals screen | `feat(dashboard): add proposals screen with approval track + review controls` |
| 8 | Committee screen | `feat(dashboard): add committee screen with divisions + applications` |
| 9 | Notifications screen | `feat(dashboard): add notifications screen` |
| 10 | Admin screen | `feat(dashboard): add admin screen` |
| 11 | Polish (typecheck + lint + manual QA) | `chore(dashboard): typecheck + lint pass` |

## Out of Scope v1

Sesuai `design_handoff_committee_hub/README.md`:

- Tweaks panel (designer-only).
- Multi-theme switcher (slate/stripe/campus/graphite). Pakai theme existing only.
- QR ticket scanner UI (cukup input code).
- File upload untuk `Proposal.documentUrl` (URL string).
- Calendar view untuk events.
- Bulk select operations.
- Email digest templates.
- Audit log detail view.
