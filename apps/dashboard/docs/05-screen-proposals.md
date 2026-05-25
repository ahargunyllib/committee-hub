# 05 — Proposals Screen (Phase 7)

## Goal

2-col layout: list proposal (kiri, selectable) + detail panel (kanan, approval track + review controls). Create proposal dialog. Resubmit untuk submitter sendiri.

## Prerequisites

Phase 0-6 done.

## Design Ref

> Page-head subtitle: "(N) pending · (N) need revision · (N) approved". Primary "+ Submit proposal".
>
> Filter pattern: search + status segmented + scope segmented.
>
> 2-col grid (1fr / 1.3fr) — collapses to single col ≤1100px.
>
> Left: list — selectable rows (.is-selected uses --selected wash). Title + meta (mono id · event name) + meta (scope · round · relative date) + status badge.
>
> Right: ProposalDetail card — title + subtitle (mono id + event ref). Action row: status badge + subtle "Open document". Meta strip: Submitted by, Scope, Round, Submitted. Approval track (vertical levels). Review controls (only for active reviewer). Resubmit button (only for submitter on rejected/revision_requested).

## API Endpoints

- `GET /proposals?status=&scope=&submittedById=`
- `GET /proposals/:id`
- `GET /proposals/:id/approvals`
- `POST /proposals` (create)
- `POST /proposals/:id/submit` (resubmit)
- `POST /proposals/:id/reviews` (decide)
- `GET /events` (untuk dropdown event)
- `GET /admin/users` (untuk submitter name lookup; atau cache di local) — alternative: extend API supaya include submitter info di response

## Folder Structure

```
src/features/proposal/
├── stores/
│   ├── use-proposals-filter-store.ts
│   └── use-selected-proposal-store.ts
├── hooks/
│   ├── use-proposals-list.ts
│   ├── use-proposal-detail.ts
│   ├── use-proposal-approvals.ts
│   ├── use-create-proposal-form.ts
│   ├── use-review-proposal.ts
│   └── use-resubmit-proposal.ts
├── containers/
│   └── proposals-container.tsx
├── components/
│   ├── proposals-filter-bar.tsx
│   ├── proposal-list.tsx
│   ├── proposal-detail.tsx
│   ├── approval-track.tsx
│   ├── review-controls.tsx
│   └── create-proposal-dialog.tsx
└── utils/
    ├── variant-mapper.ts            # proposalStatusVariant
    └── approval-track-helpers.ts
```

## Key Logic

### Levels per scope

```ts
// utils/approval-track-helpers.ts
import type { ProposalScope, ProposalApproval } from "@/shared/lib/types";

export function levelsForScope(scope: ProposalScope): ("ormawa" | "fakultas" | "universitas")[] {
  if (scope === "ormawa") return ["ormawa"];
  if (scope === "fakultas") return ["ormawa", "fakultas"];
  return ["ormawa", "fakultas", "universitas"];
}

export type LevelState = "done" | "active" | "queued";

export function deriveLevelStates(
  scope: ProposalScope,
  approvals: ProposalApproval[],
  currentRound: number,
): Array<{ level: "ormawa" | "fakultas" | "universitas"; state: LevelState; approval?: ProposalApproval }> {
  const levels = levelsForScope(scope);
  const roundApprovals = approvals.filter((a) => a.submissionRound === currentRound);
  const decidedLevels = new Set(roundApprovals.map((a) => a.level));

  let activeFound = false;
  return levels.map((level) => {
    const approval = roundApprovals.find((a) => a.level === level);
    if (approval) {
      return { level, state: "done" as LevelState, approval };
    }
    if (!activeFound) {
      activeFound = true;
      return { level, state: "active" as LevelState };
    }
    return { level, state: "queued" as LevelState };
  });
}
```

### Permission to review

```ts
// utils/approval-track-helpers.ts
const ROLE_TO_LEVEL: Record<string, "ormawa" | "fakultas" | "universitas" | null> = {
  ormawa: "ormawa",
  fakultas: "fakultas",
  universitas: "universitas",
  mahasiswa: null,
  ketua_panitia: null,
  admin: null,
};

export function canReview(
  userRole: string,
  states: ReturnType<typeof deriveLevelStates>,
): boolean {
  const myLevel = ROLE_TO_LEVEL[userRole];
  if (!myLevel) return false;
  const active = states.find((s) => s.state === "active");
  return active?.level === myLevel;
}
```

## File Outlines

### `containers/proposals-container.tsx`

```tsx
export function ProposalsContainer() {
  const { data: session } = useSession();
  const user = session?.user;
  const selectedId = useSelectedProposalStore((s) => s.id);
  const setSelected = useSelectedProposalStore((s) => s.setId);
  const { data: proposals, isPending } = useProposalsList();

  // Auto-select first on load
  useEffect(() => {
    if (!selectedId && proposals?.length) setSelected(proposals[0].id);
  }, [proposals, selectedId, setSelected]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proposals"
        subtitle={`${countByStatus(proposals, "pending")} pending · ${countByStatus(proposals, "revision_requested")} need revision · ${countByStatus(proposals, "approved")} approved`}
        actions={<Button onClick={() => setCreateOpen(true)}>+ Submit proposal</Button>}
      />
      <ProposalsFilterBar />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <ProposalList proposals={proposals ?? []} selectedId={selectedId} onSelect={setSelected} loading={isPending} />
        {selectedId ? <ProposalDetail proposalId={selectedId} userRole={user!.role} userId={user!.id} /> : <EmptySelection />}
      </div>
      <CreateProposalDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
```

### `components/proposal-list.tsx`

Row: `<button className={cn("flex w-full gap-3 rounded-md border p-3 text-left hover:bg-muted/50", selected && "bg-primary/10 border-primary")}>`. Title + meta + StatusBadge right.

### `components/proposal-detail.tsx`

Card dengan section:
1. Header: title (h2) + subtitle mono id + event name. Right: StatusBadge + Button "Open document" (external link icon, opens `documentUrl` in new tab).
2. Meta strip (4-col grid): Submitted by (Avatar + name), Scope, Round, Submitted (relative).
3. `<ApprovalTrack />`.
4. Conditional `<ReviewControls />` (if `canReview`).
5. Conditional Resubmit button (if submitter + status in [rejected, revision_requested]).

### `components/approval-track.tsx`

Vertical list of cards per level:

```tsx
{states.map((s, idx) => (
  <div key={s.level} className="flex gap-3">
    <Circle state={s.state} num={idx + 1} />
    <Card className="flex-1 p-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium capitalize">{s.level}</div>
          {s.state === "done" && s.approval ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {/* "<reviewer name> · approved" or " · rejected" + notes */}
              decision: {s.approval.decision}
              {s.approval.notes ? ` — ${s.approval.notes}` : ""}
            </p>
          ) : s.state === "active" ? (
            <p className="mt-1 text-xs text-muted-foreground">Awaiting review</p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">Queued</p>
          )}
        </div>
        <StatusBadge
          variant={s.state === "done" ? decisionVariant(s.approval!.decision) : s.state === "active" ? "pending" : "draft"}
          label={s.state === "done" ? s.approval!.decision : s.state === "active" ? "active" : "queued"}
        />
      </div>
    </Card>
  </div>
))}
```

`Circle` colored per state (green/accent/grey).

### `components/review-controls.tsx`

Inset well dengan Textarea (notes) + 3 buttons (Reject danger, Request revision ghost, Approve success):

```tsx
const [notes, setNotes] = useState("");
const mutation = useReviewProposal(proposalId);

const decide = (decision: "approved" | "rejected" | "revision_requested") => {
  mutation.mutate({ reviewerId: userId, level: activeLevel, decision, notes });
};

return (
  <div className="rounded-md border bg-muted/40 p-4">
    <Label>Review notes</Label>
    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" />
    <div className="mt-3 flex justify-end gap-2">
      <Button variant="destructive" onClick={() => decide("rejected")}>Reject</Button>
      <Button variant="ghost" onClick={() => decide("revision_requested")}>Request revision</Button>
      <Button onClick={() => decide("approved")}>Approve</Button>
    </div>
  </div>
);
```

### `hooks/use-review-proposal.ts`

```ts
export function useReviewProposal(proposalId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { reviewerId: string; level: ProposalScope; decision: ProposalDecision; notes?: string }) =>
      api.post<ProposalApproval>(`/proposals/${proposalId}/reviews`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proposals"] });
      toast.success("Decision recorded");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
```

### `components/create-proposal-dialog.tsx`

Form fields: event Select (from `useQuery(["events","list"])`, defaultnya user's events), title, scope Select (helper "Determines approval chain."), documentUrl, description. POST `/proposals` dengan `submittedById = session.user.id`.

## Route

```tsx
// src/routes/dashboard/proposals.tsx
import { createFileRoute } from "@tanstack/react-router";
import { ProposalsContainer } from "@/features/proposal/containers/proposals-container";

export const Route = createFileRoute("/dashboard/proposals")({
  component: ProposalsContainer,
});
```

## Edge Cases

- Empty list → EmptyState "No proposals match" + reset.
- Detail panel kosong (sebelum select) → "Select a proposal".
- Active level tapi user bukan reviewer role → review controls hidden.
- Resubmit: hanya tampil jika `user.id === proposal.submittedById && status in ["rejected","revision_requested"]`.

## Acceptance Criteria

- Click row → detail panel berubah.
- Approval track render sesuai scope (1/2/3 levels).
- Login sebagai ormawa user → bisa Approve proposal pending di level ormawa.
- Setelah Approve, status berpindah (pending → next level, atau approved jika last).
- Create proposal works → muncul di list.
- Resubmit tombol hanya untuk submitter di status non-pending non-approved.

## Commit

```
feat(dashboard): add proposals screen with approval track + review controls
```
