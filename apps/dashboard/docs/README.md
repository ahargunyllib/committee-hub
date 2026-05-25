# committee-hub Dashboard — Implementation Guide

Dokumentasi ini adalah hand-off internal untuk mengimplementasi `apps/dashboard` dari design reference di `apps/dashboard/design_handoff_committee_hub/` menggunakan stack existing (Vite + React 19 + TanStack Router + Tailwind v4 + shadcn/ui + better-auth + TanStack Query).

Setiap file di folder ini self-contained, jadi agent (atau developer) bisa pickup phase mana pun tanpa perlu re-explore codebase.

## Cara Baca

Baca berurutan kalau mulai dari nol:

1. **[00-overview.md](./00-overview.md)** — Big picture: stack, struktur folder, prinsip kerja.
2. **[conventions.md](./conventions.md)** — Aturan main: naming, query keys, error handling, form pattern.
3. **[design-tokens.md](./design-tokens.md)** — Mapping warna/font/radius dari handoff ke shadcn yang sudah ada. Hanya tambahkan status colors.
4. **[api-reference.md](./api-reference.md)** — Semua endpoint dari `apps/api` plus shape request/response.
5. **[01-foundation.md](./01-foundation.md)** — Phase 0-2: install deps, shadcn add, bikin `shared/lib/*`.
6. **[02-layout-and-auth.md](./02-layout-and-auth.md)** — Phase 3-4: protected layout (sidebar + topbar) + login.
7. **Phase per screen** (eksekusi berurutan, tiap phase 1 commit kecil):
   - [03-screen-overview.md](./03-screen-overview.md)
   - [04-screen-events.md](./04-screen-events.md)
   - [05-screen-proposals.md](./05-screen-proposals.md)
   - [06-screen-committee.md](./06-screen-committee.md)
   - [07-screen-notifications.md](./07-screen-notifications.md)
   - [08-screen-admin.md](./08-screen-admin.md)

## Prinsip Utama

- **Mirror struktur `tedx-2026/apps/dashboard`** — `features/<module>/{components,containers,hooks,stores,types,utils}` + `shared/{components,hooks,lib}` + `routes/dashboard/*`.
- **Reuse shadcn/ui** — Jangan bikin manual button/input/dialog dsb. Install via `bunx shadcn@latest add <name>`.
- **Keep existing tokens** — Pertahankan font (Space Grotesk + Manrope) dan primary color (yellow) yang sudah ada di `src/index.css`. Hanya tambah token status colors (draft/open/pending/dst.) yang belum ada.
- **Icons** — `@hugeicons/react` (sudah terinstall, configured di `components.json`).
- **Routing** — `/auth/login` (public), `/dashboard/*` (protected, `beforeLoad` cek `authClient.getSession()`). `/` redirect ke `/dashboard/overview`.
- **API** — Plain REST. Fetch wrapper kecil di `shared/lib/api.ts` (bukan tRPC). `credentials: "include"` untuk cookie better-auth.
- **Data fetching** — TanStack Query, key per modul.
- **Forms** — `@tanstack/react-form` + Zod.
- **Filter state** — Zustand store per feature.
- **Commit kecil-kecil** — Tiap phase = 1 commit. Format: `feat(dashboard): <action>` atau `chore(dashboard): <action>`. Lihat tiap file phase untuk commit message yang disarankan.
- **Branch** — Push ke `claude/loving-planck-4KveB`.

## Status Implementasi

Centang ✅ saat phase selesai (edit README ini setelah commit).

- [x] Phase 0 — Install deps & shadcn primitives
- [x] Phase 1 — Shared lib (api, auth, query, permissions, format, string)
- [x] Phase 2 — Status color tokens
- [x] Phase 3 — Protected dashboard layout (sidebar + topbar)
- [x] Phase 4 — Login screen
- [x] Phase 5 — Overview screen
- [x] Phase 6 — Events screen
- [x] Phase 7 — Proposals screen
- [x] Phase 8 — Committee screen
- [x] Phase 9 — Notifications screen
- [x] Phase 10 — Admin screen
- [ ] Phase 11 — Polish (typecheck + lint pass + manual QA)

## Quick Commands

```bash
# Dev
bun --cwd apps/api dev          # backend on :3000
bun --cwd apps/dashboard dev    # frontend on :5173

# Quality
bun typecheck                   # full repo
bun fix                         # ultracite + biome

# Shadcn
cd apps/dashboard
bunx shadcn@latest add <component-name>

# DB (jika fresh)
bun --cwd apps/api db:push
```
