# Handoff: committee-hub

A campus event & committee management dashboard. Centralises event creation, sequential proposal approvals (Ormawa → Fakultas → Universitas), committee recruitment, participant registration with ticketing, and in-app notifications.

---

## About these files

**The files in this bundle are design references created in HTML/React-via-Babel.** They are prototypes that show the intended look and behaviour — **not production code to copy directly**. The implementer's job is to **recreate these designs in the target codebase's existing environment** (Next.js, Remix, Vue/Nuxt, SwiftUI, native, etc.) using its established patterns, component library, routing, auth, and data layer. If no environment exists yet, choose the most appropriate framework for the team and implement there.

In particular, **do not ship**:
- The in-browser Babel setup (`@babel/standalone`) — set up a real toolchain.
- `window.DATA` / `Object.assign(window, …)` cross-script wiring — use real imports.
- The `<script type="text/babel">` tags — compile JSX ahead-of-time.
- The Tweaks panel — it is a designer prop for previewing themes/roles, not a production feature.

## Fidelity

**High-fidelity.** Exact colours, type stack, spacing, radii, and component states are specified. Recreate the UI pixel-close using the codebase's existing libraries; only fall back to lookalikes where the codebase has a strong equivalent (e.g. an established Button component) — match the visual intent in that case.

---

## How to run the reference

Open `index.html` in a browser (it loads React/Babel/Geist via CDN). All scripts run client-side, no build required. The Tweaks panel in the bottom-right swaps the active user (across all 6 roles), theme, and density — useful for seeing the same screen from different role perspectives.

---

## Roles

Six roles drive what a user can see and do. Use these exact identifiers in the data model.

| Role id              | Indonesian label    | What they do                                                                  |
|----------------------|---------------------|-------------------------------------------------------------------------------|
| `mahasiswa`          | Mahasiswa           | Registers for events, applies to committee divisions                          |
| `ketua_panitia`      | Ketua Panitia       | Creates events, divisions, submits proposals, reviews applicants              |
| `pengurus_ormawa`    | Pengurus Ormawa     | First proposal approver                                                       |
| `pihak_fakultas`     | Pihak Fakultas      | Second proposal approver                                                      |
| `pihak_universitas`  | Pihak Universitas   | Final approver (universitas-scope only)                                       |
| `admin_sistem`       | Admin Sistem        | User/role management, system config, activity audit                           |

New users from Google sign-in default to `mahasiswa`.

---

## Information architecture

Left sidebar nav, top bar (breadcrumb + global search + user pill with role + sign out), main content area. Sidebar nav items (in order):

1. **Overview** — dashboard with stats + workflow strip + upcoming events + proposal queue
2. **Events** — search, filter, create, manage, register, verify ticket
3. **Proposals** — list + selectable detail panel with approval track and review controls
4. **Committee** — event selector → divisions → applications (accept/reject)
5. **Notifications** — All / Unread / Read tabs, mark read, mark all read
6. **Admin** (admin_sistem only) — user management, system config, activity feed

Each nav item shows a count badge for actionable items (open events, pending proposals, pending applications, unread notifications — the last is accented).

---

## Design tokens

All tokens are declared in `styles.css` under `:root` and theme variants `[data-theme="…"]`. The reference ships four themes; **`slate` is the canonical/default**. The others are designer-preview only — pick the one that fits your brand or strip the rest.

### Typography

```
--font-sans: 'Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif
--font-mono: 'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace
```

Base body font-size `14px`, line-height `1.45`, antialiased. `font-feature-settings: 'cv11', 'ss03'` for Geist's stylistic alternates.

Type scale (px / weight / letter-spacing):
- Page H1 — `22 / 600 / -0.012em`
- Section H3 (card title) — `13.5 / 600 / -0.005em`
- Stat value — `26 / 600 / -0.02em`, `font-variant-numeric: tabular-nums`
- Body — `14 / 400`
- Meta / muted — `12.5–13 / 400`, colour `--text-muted`
- Label / uppercase eyebrow — `11 / 500`, `letter-spacing: 0.04em`, uppercase
- Tabular numerals on all counters, dates, percentages, IDs

### Colour — `slate` theme (canonical)

| Token             | Hex / value         | Use                                              |
|-------------------|---------------------|--------------------------------------------------|
| `--bg`            | `#f7f7f8`           | App background                                   |
| `--bg-2`          | `#f0f0f2`           | Subtle wash (segmented bg, count pill)           |
| `--surface`       | `#ffffff`           | Cards, inputs, popovers                          |
| `--surface-2`     | `#fafafb`           | Card footers, table headers, "inside-card" wells |
| `--border`        | `#e7e7ea`           | Primary border                                   |
| `--border-2`      | `#ededf0`           | Inner row separators                             |
| `--text`          | `#18181b`           | Primary text                                     |
| `--text-muted`    | `#71717a`           | Secondary text, labels                           |
| `--text-dim`      | `#a1a1aa`           | Tertiary, placeholder, separators                |
| `--accent`        | `#4f46e5`           | Primary action, selection, brand mark            |
| `--accent-fg`     | `#ffffff`           | Text on accent                                   |
| `--accent-soft`   | `#eef0ff`           | Soft accent fill (selected nav row)              |
| `--accent-soft-fg`| `#3730a3`           | Text on soft accent                              |
| `--sidebar-bg`    | `#fbfbfc`           | Sidebar background                               |
| `--topbar-bg`     | `rgba(255,255,255,0.85)` (backdrop-filter blur 8px) | Topbar |
| `--shadow-card`   | `0 1px 0 rgba(15,15,20,.02), 0 0 0 0.5px rgba(15,15,20,.04)` | Card |
| `--shadow-pop`    | `0 1px 2px rgba(15,15,20,.06), 0 8px 24px rgba(15,15,20,.08)` | Modal |

### Status colours (theme-independent)

Used by `StatusBadge`. Each status has bg / fg / border:

| Status              | bg          | fg          | border      |
|---------------------|-------------|-------------|-------------|
| draft               | `#f4f4f5`   | `#52525b`   | `#e4e4e7`   |
| open / approved / accepted | `#e7f6ee` | `#126b3a`   | `#c4e7d2`   |
| closed              | `#f4f4f5`   | `#71717a`   | `#e4e4e7`   |
| pending             | `#fff7e0`   | `#92590b`   | `#f6e3a3`   |
| rejected            | `#fdecec`   | `#a02020`   | `#f3c8c8`   |
| revision_requested  | `#e6efff`   | `#1d4ed8`   | `#c2d6f8`   |
| internal (event)    | `#eef2f7`   | `#334155`   | `#dbe2eb`   |
| external (event)    | `#f1ecff`   | `#4c2bb8`   | `#ddd1ff`   |

### Spacing & radii

| Token            | Value      |
|------------------|------------|
| `--pad-section`  | `24px` (comfortable) / `18px` (dense) — outer page padding & grid gaps |
| `--pad-card`     | `18px` / `14px` — card inner padding |
| `--row-h`        | `52px` / `40px` — table row height |
| Card radius      | `8px` (must not exceed per spec) |
| Button radius    | `6px` (md) / `5px` (sm) |
| Input radius     | `6px` |
| Badge radius     | `4px` |
| Pill / segmented | `7px` outer, `5px` inner |
| Avatar           | `999px` (circle) |
| Modal            | `10px` |

### Density

Single toggle (`comfortable` ↔ `dense`) re-binds `--pad-section`, `--pad-card`, `--row-h`. Default is comfortable.

---

## Components

Implement these as your codebase's idiomatic component types (functional React components, Vue SFCs, etc.). All names below are the source-file names — re-name to your conventions.

### Button (`ui.jsx → Button`)
- Variants: `default` (white surface + border), `primary` (`--accent` fill), `subtle` (transparent, hover wash), `danger` (red soft), `success` (green soft).
- Sizes: `md` (32px tall, 12px x-pad, 13px font) and `sm` (26px tall, 9px x-pad, 12px font).
- Optional leading icon, optional `iconOnly` (square, 32px or 26px). Disabled = 50% opacity, no pointer events.
- Always renders a real `<button>` with `aria-label` when icon-only.

### Badge (`ui.jsx → Badge` / `StatusBadge` / `RoleBadge`)
- 21px tall, 7px x-pad, 11.5px font, 4px radius, 1px border. Optional leading `dot` (6px round, currentColor 80% opacity).
- `StatusBadge` maps status enum → bg/fg/border token + human label.
- `RoleBadge` uses role-specific soft pastel fills; height 22px.

### Card (`ui.jsx → Card`)
- 8px radius, 1px `--border`, `--shadow-card`. Three slots: head (title + subtitle + action), body (default 18px pad; pass `tight` to remove pad e.g. for embedded lists/tables), foot (`--surface-2` bg, 10/18 pad).
- **Do not nest cards inside cards** — use background wells (`--surface-2` + inner border) or section dividers instead.

### Input / Textarea / Select (`ui.jsx`)
- 34px tall, 10px x-pad, 6px radius. Focus ring: `color-mix(in oklch, var(--accent) 20%, transparent)` 3px outset, border shifts to lighter accent.
- `Input` accepts optional leading icon (positioned absolute 9px from left, 14px size).
- `Select` uses an inline SVG chevron as background, 28px right pad.
- All inputs paired with `<Field>` wrapper (label + hint or error). Labels are 12px / 500 / `--text-muted`.

### Avatar
- Initials in `Geist Mono`, 11px (md = 28px circle), 10px (sm = 22px), 12px (lg = 36px). Hash user id → one of 8 pastel hues. Foreground `#3a3a3f`. Initials are first letter of first + last name OR an explicit `image` field (the data uses 2-letter codes as a placeholder for real photos).

### Segmented control (`ui.jsx → Segmented`)
- Wraps a row of toggles in a `--bg-2` bordered track. Active item gets white surface + tiny shadow.

### EmptyState
- Centred icon-in-rounded-square + title (medium weight) + optional description (12.5px muted) + optional action button.

### Sidebar nav item (`styles.css → .nav-item`)
- 32px tall, 10px x-pad, 6px radius. Hover: `--hover` wash. Active: `--selected` wash + 2.5px accent indicator on the left edge.
- Optional count chip on the right (18px pill). The Notifications item uses `is-accent` (filled accent bg, white text) when count > 0.

### Topbar user pill
- 40px tall, 24px radius, 1px border. Stacks first-name (12.5px / 500) over role badge (height 18px, 10.5px font). Sign-out is an icon-only sm subtle button on the right.

---

## Screens

### 0. Login (`screen-login.jsx`)
- Centred 360×~360 card, `--shadow-pop`, 10px radius, 32px x-pad.
- Logo mark (30px, 7px radius, accent gradient) + product name (18 / 600) + 1-line subtitle.
- "Continue with Google" button: 40px tall, 7px radius, official Google G logo (4-color SVG, 18px) + label.
- Foot row (small muted text): "New accounts join as `mahasiswa`." — mono span for the role.
- During sign-in, swap label to "Signing you in…" with an 0.8s rotating spinner; persist 700ms before transitioning.

### 1. Overview (`screen-overview.jsx`)
Page-head greets user by first name with a one-line subtitle ("Monday, May 25 · 4 open events · 3 proposals in flight"). Page actions: subtle Refresh + primary "+ New event".

Four stat tiles in a 4-col grid (collapses to 2 ≤1100px):
1. **System health** — text value "OK", inline green dot + "All services normal", foot "api.committee-hub · last check 1m ago".
2. **Open events** — count + delta "(N) draft", foot "(N) total this semester".
3. **Pending proposals** — count + warn-coloured delta "(N) need revision", foot scope summary.
4. **Unread notifications** — count + accent dot on label, foot pending-applications hint.

**Workflow strip** (`.workflow`) — flat 4-column inline section showing where active events sit in the pipeline: Divisions → Proposal → Registration → Notifications. Each step: small mono `01`/`02`/… numeral top-right, uppercase eyebrow label, primary value, meta line, 4px progress bar at the bottom.

Bottom row, two columns (1.35fr / 1fr, collapses to single col):
- **Upcoming events** — list of 5 rows. Each row: 44×44 date chip (month uppercase 9.5px + day 16px / 600), title, meta row (pin icon + location, users icon + quota, mono `--text-dim` id), type badge (`internal` / `external`), status badge.
- **Proposal work queue** — pending + revision rows. Each: title, avatar + submitter name + id + round + scope, right column: status badge + relative time.

### 2. Events (`screen-events.jsx`)
Page-head + actions row (subtle "Verify ticket", primary "+ Create event" if `ketua_panitia` or `admin_sistem`).

Filter row:
- Search input (icon: magnifier, placeholder "Search by name, location, or id…"), 320px wide
- Status segmented (All / Open / Draft / Closed, each with count)
- Type segmented (All / Internal / External) — labelled "Type" to the left

Event grid: `repeat(auto-fill, minmax(320px, 1fr))`, 24px gap. **Event card** structure:
- Head: title (14.5 / 600) + 2-line clamped description; right rail: status badge + type badge stacked.
- Meta-grid (2-col, in a wells with top border): calendar icon + bolded date, clock icon + relative time, pin icon + location (truncated), users icon + "quota N".
- Actions footer (`--surface-2`): mono id on the left; on the right — Register / Registered (with check icon) for open events; Open / Close / Reopen for managers; "…" overflow button.

Empty state: events icon, "No events match", reset-filters subtle button.

**Create event modal** — name (required), date (defaults to +14 days), location (required), quota (required, ≥1), type select (internal | external with helper text "Internal events skip Fakultas/Universitas approval."), description textarea. Inline error states under each field. Submits → status `draft`. Primary CTA "Create as draft".

**Verify ticket modal** — single code field with hint "Codes look like CMTHB-XXXX-XXXX." 600ms simulated round-trip then success or error toast.

Toast: positioned inline in the page-actions row; auto-dismisses after 2.4s.

### 3. Proposals (`screen-proposals.jsx`)
Page-head subtitle: "(N) pending · (N) need revision · (N) approved". Primary "+ Submit proposal".

Same-row filter pattern as Events (search + status segmented + scope segmented).

Two-column grid (1fr / 1.3fr) — collapses to single col ≤1100px.

**Left: proposal list** — selectable rows (`.row-item.is-selected` uses `--selected` wash). Each row: title + meta (mono id · event name) + meta (scope · round · relative date) + status badge on the right.

**Right: ProposalDetail card** —
- Title in card-head + subtitle with mono id and event reference. Action row: status badge + subtle "Open document" button (external-link icon).
- Meta strip: Submitted by (avatar + name), Scope (capitalised), Round, Submitted (relative).
- **Approval track** — vertical list of `levels` derived from scope. Each step is a card with numbered circle on the left:
  - Done = green-tinted circle, reviewer name + decision + notes inline
  - Active = accent-filled circle, "Awaiting review"
  - Queued = grey circle, "Queued"
  - Right rail: status badge per level
- **Review controls** (only when current user's role matches the active level): inset well (`--surface-2`), notes textarea, three buttons right-aligned: `danger` "Reject", `subtle` "Request revision", `success` "Approve". Disabled when not the active reviewer.
- **Resubmit** button (primary, refresh icon) — only when the submitter views their own rejected/revision-requested proposal. Bumps `submissionRound`, resets status to `pending`.

**Create proposal modal** — event select (defaults to user's events), title, scope select (with note "Determines approval chain."), documentUrl, description. Submits → status `pending`, round 1.

### 4. Committee (`screen-committee.jsx`)
Page-head + "+ Create division" (only when current user is event lead).

Event selector row: Select labelled "Event" (340px wide, lists non-closed events). Right rail: badges showing division count + application count + event status.

Two-column grid (1fr / 1.2fr, collapses ≤1100):
- **Left: divisions list** — Each row: name (14.5 / 600), description (truncated, max 340px), meta line (users icon + "N/quota filled", created relative time, mono id). Right rail per row: `FillMeter` — mono "N/quota" + 64×4 progress bar.
- **Right: selected division panel** — title + description in card-head, right rail badges (N/quota, pending count badge with dot).
  - Above the apps list (only for `mahasiswa` viewing): apply-CTA banner — `--surface-2` well with "Apply to {division}" heading, helper text, primary "Apply" button. After applying, show their submitted application status instead.
  - Apps list (bordered inset ul): avatar 36px + name + mono id + dept + motivation in quotes + applied-relative-time. Right rail: status badge; if lead and status `pending`, an Accept (success, check icon) + Reject (danger, X icon) pair below.

Empty states for "no divisions yet" and "no applications yet".

**Create division modal** — name (required), quota (required, ≥1), description.

**Apply modal** — explainer line, motivation textarea (≥8 chars), Cancel + primary "Send application".

### 5. Notifications (`screen-notifications.jsx`)
Subtitle: "(N) unread of (M) total". Page action: subtle "Mark all read" (disabled when no unread).

Filter row: segmented control All / Unread / Read with counts. Right of it: "Showing (filtered count)".

List card (`tight` body). Each row:
- 30×30 icon pill — colour matched to notification kind (e.g. `proposal_approved` → green soft, `proposal_rejected` → red soft, `application_*` uses users icon, `registration_success` uses ticket icon).
- Title row: 7px accent dot if unread, then label (`fontWeight: 600` unread / `500` read).
- Message line below, 12.8px `--text-muted`.
- Right rail: relative time (12px muted), then "Mark read" (sm subtle) if unread, dim "Read" text if read.
- Unread row background: subtle accent tint (`color-mix(in oklch, var(--accent) 4%, var(--surface))`).

Empty states: "Inbox zero" for Unread / "No notifications" for All.

### 6. Admin (`screen-admin.jsx`) — admin_sistem only
Four stat tiles at the top: Users, Config keys, Activity (24h), Sessions.

Two-column grid (1.6fr / 1fr):
- **User management card** — header has search input + role filter Select. Table columns: User (avatar + name + dept), Email (muted), Role (Select inline, disabled for the current user themselves), "…" overflow icon column.
- **Activity feed card** — list of 8 entries: avatar + bold name + verb (muted) + target (truncated, dim mono date on right).

Below: **System configuration** card — table of key / value / type / description / updated / Edit button. Values show in mono badges. Add Key button in card-head. Edit/Create modal: key (disabled when editing), valueType select (string / number / boolean), value (validated against type), description textarea.

---

## Interactions & state

State management uses a single reducer (see `app.jsx → reducer`). Translate these action types into your store/server API:

| Action                       | Effect                                                                                          |
|------------------------------|-------------------------------------------------------------------------------------------------|
| `CREATE_EVENT`               | New event, status `draft`, `createdById = currentUser.id`                                       |
| `UPDATE_EVENT_STATUS`        | draft → open → closed (Reopen allowed)                                                          |
| `CREATE_PROPOSAL`            | New proposal, status `pending`, `submissionRound = 1`                                           |
| `RESUBMIT_PROPOSAL`          | Bump `submissionRound`, status → `pending`, update `submittedAt`                                |
| `REVIEW_PROPOSAL`            | Insert ProposalApproval; transition status (see below)                                          |
| `CREATE_DIVISION`            | Tied to `eventId`                                                                               |
| `APPLY_DIVISION`             | One application per user per division (enforce uniqueness server-side); status `pending`        |
| `REVIEW_APPLICATION`         | accept/reject, set `reviewedById` + `reviewedAt`                                                |
| `MARK_READ` / `MARK_ALL_READ`| Set `read=true`, stamp `readAt`                                                                 |
| `CHANGE_ROLE`                | Admin-only, can't change own                                                                    |
| `UPSERT_CONFIG`              | Validate value against `valueType` (number → numeric, boolean → 'true'/'false')                 |

### Proposal status transition (in `REVIEW_PROPOSAL`)
For the **current `submissionRound`**:
- decision `rejected` → proposal `rejected`
- decision `revision_requested` → proposal `revision_requested`
- decision `approved`:
  - If approvals for this round cover **every level required by the scope** (`ormawa` → [ormawa]; `fakultas` → [ormawa, fakultas]; `universitas` → [ormawa, fakultas, universitas]), proposal `approved`.
  - Otherwise the proposal stays `pending` and the next level becomes active.

A reviewer can only act on a proposal where their role matches the **active** (next-undecided) level for the current round.

### Notifications fired by these transitions
- `proposal_approved`, `proposal_rejected`, `proposal_revision_requested` — to the submitter.
- `application_accepted`, `application_rejected` — to the applicant.
- `registration_success` — to the participant when a ticket is issued.

### Transitions / animation
- Sign-in: 700ms simulated round-trip (button label swaps to "Signing you in…" with a spinner).
- Verify ticket: 600ms simulated round-trip.
- Toast: appears inline in page actions, fades after 2400ms. Use real toast/snackbar library (e.g. Radix Toast, Sonner, your existing system).
- Modal: dark scrim `rgba(20,20,25,0.32)` + 2px backdrop blur. Escape closes. Max 90vh height, internal scroll.
- Card / nav-item hover: 120ms ease background.

---

## Data model

All entities live in `data.jsx` as sample data. The schema you ship to your backend:

```ts
type Role =
  | 'mahasiswa' | 'ketua_panitia' | 'pengurus_ormawa'
  | 'pihak_fakultas' | 'pihak_universitas' | 'admin_sistem';

interface User {
  id: string; name: string; email: string; image: string | null;
  role: Role; emailVerified: boolean | null;
  createdAt: string; updatedAt: string;
}

interface Event {
  id: string; createdById: string;
  name: string; description: string;
  date: string;                              // ISO date
  location: string; quota: number;
  type: 'internal' | 'external';
  status: 'draft' | 'open' | 'closed';
  createdAt: string; updatedAt: string;
}

interface Proposal {
  id: string; eventId: string; submittedById: string;
  title: string; description: string; documentUrl: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  scope: 'ormawa' | 'fakultas' | 'universitas';
  submissionRound: number;                   // 1, 2, 3, …
  submittedAt: string;
  createdAt: string; updatedAt: string;
}

interface ProposalApproval {
  id: string; proposalId: string; reviewerId: string;
  level: 'ormawa' | 'fakultas' | 'universitas';
  decision: 'approved' | 'rejected' | 'revision_requested';
  notes: string;
  submissionRound: number;                   // matches Proposal.submissionRound at decision time
  createdAt: string;
}

interface Division {
  id: string; eventId: string;
  name: string; description: string; quota: number;
  createdAt: string; updatedAt: string;
}

interface CommitteeApplication {
  id: string; divisionId: string; userId: string;
  status: 'pending' | 'accepted' | 'rejected';
  motivation: string;
  reviewedById: string | null; reviewedAt: string | null;
  createdAt: string; updatedAt: string;
}

interface Registration {
  id: string; eventId: string; userId: string;
  createdAt: string;
}

interface Ticket {
  id: string; registrationId: string; code: string;
  status: 'active' | 'used' | 'cancelled';
  usedAt: string | null;
  createdAt: string; updatedAt: string;
}

interface Notification {
  id: string; userId: string;
  type:
    | 'proposal_approved' | 'proposal_rejected' | 'proposal_revision_requested'
    | 'application_accepted' | 'application_rejected'
    | 'registration_success';
  message: string; read: boolean;
  referenceType: 'event' | 'proposal' | 'application' | string;
  referenceId: string; readAt: string | null;
  createdAt: string;
}

interface SystemConfig {
  id: string; key: string; value: string;
  valueType: 'string' | 'number' | 'boolean';
  description: string;
  updatedById: string;
  createdAt: string; updatedAt: string;
}
```

Auth: Google OAuth only. New users land as `mahasiswa`. Domain restriction lives in `SystemConfig` under `auth.allowed_domain`.

Ticket codes: prefix from `SystemConfig` `ticket.code_prefix` (default `CMTHB-`). Format used in the reference: `CMTHB-XXXX-XXXX`.

---

## Accessibility

- Semantic HTML throughout: `<button>`, `<a>`, `<form>`, `<label>`, `<nav>`, `<aside>`, `<header>`, `<main>`, lists for list-shaped content.
- All inputs paired with `<label htmlFor>`.
- Icon-only buttons must carry `aria-label`.
- Selected nav item uses `aria-current="page"`.
- Segmented controls use `role="radiogroup"` / `aria-selected`.
- Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, Escape to close, focus trap recommended.
- All status conveyed via colour also carries a label (the badge text), so colour is never the sole carrier.
- Focus ring: 3px outer accent-tinted ring on inputs/buttons (don't strip it).

---

## Responsive behaviour

Single breakpoint at `760px`:
- Sidebar becomes a fixed overlay (280px wide, 80vw cap) triggered by a menu button in the topbar.
- Global search hides ≤900px.
- Stats / multi-col grids collapse to single column.
- `--pad-section` drops from 24 → 16, gaps tighten.

The reference uses `1100px` as the secondary breakpoint where 4-up stats collapse to 2-up and 2-pane screens (Proposals, Committee) stack.

---

## Assets

- **Fonts**: Geist + Geist Mono via Google Fonts CDN. In production, self-host with `@font-face` and `font-display: swap`, or use your codebase's existing font stack.
- **Icons**: bespoke stroke-based SVG set in `icons.jsx`, 24×24 viewBox, 1.6 stroke weight, round caps + joins. Match these names or substitute with `lucide-react` / `phosphor-icons` (they have near-1:1 equivalents — Calendar, FileText, Users, Bell, Shield, Search, Plus, etc.). The Google G logo is the official 4-colour mark.
- **Images**: none — avatars are colour-hashed initials. When real user photos exist, drop them into the same circular slot at the same sizes.

---

## Files in this bundle

| File                        | What's in it                                                                    |
|-----------------------------|---------------------------------------------------------------------------------|
| `index.html`                | Page shell; loads React, Babel, Geist, and all jsx scripts in order             |
| `styles.css`                | All design tokens, base styles, layout, every component class                   |
| `data.jsx`                  | Sample data (users, events, proposals, divisions, applications, notifications, configs, activity) |
| `icons.jsx`                 | SVG icon set                                                                    |
| `ui.jsx`                    | Badge, Button, Card, Field, Input, Textarea, Select, Avatar, Segmented, EmptyState, Toast, date helpers |
| `layout.jsx`                | `AppShell`, `Sidebar`, `Topbar`, nav definition                                 |
| `app.jsx`                   | Root: state reducer, routing-by-state, Tweaks panel wiring                      |
| `screen-login.jsx`          | Login screen                                                                    |
| `screen-overview.jsx`       | Overview screen (stat tiles, workflow strip, upcoming + work queue)             |
| `screen-events.jsx`         | Events screen + Modal component (shared)                                        |
| `screen-proposals.jsx`      | Proposals screen + detail panel with approval track                             |
| `screen-committee.jsx`      | Committee screen + create-division + apply forms                                |
| `screen-notifications.jsx`  | Notifications screen                                                            |
| `screen-admin.jsx`          | Admin screen (users, config, activity)                                          |
| `tweaks-panel.jsx`          | Designer preview controls — **don't ship**, use only as reference for what aspects can be themed |

---

## Out of scope for v1 (designer suggestions)

These were not designed in this pass; consider them backlog:
- Ticket QR rendering & scanner UI (the reference only has a code-input verifier)
- Email digest templates for `notifications.email_relay`
- Bulk operations (multi-select rows on Events / Applications / Notifications)
- Audit log detail view (the Admin activity feed is summary-only)
- File upload for `Proposal.documentUrl` (the form expects a URL string)
- Calendar view for Events (only list/grid in v1)
