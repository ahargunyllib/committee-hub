import type {
  ProposalApproval,
  ProposalScope,
  UserRole,
} from "@/shared/lib/types";

export type ApprovalLevel = "ormawa" | "fakultas" | "universitas";
export type LevelState = "done" | "active" | "queued";

type DerivedLevel = {
  approval?: ProposalApproval;
  level: ApprovalLevel;
  state: LevelState;
};

const ROLE_TO_LEVEL: Record<UserRole, ApprovalLevel | null> = {
  admin: null,
  fakultas: "fakultas",
  ketua_panitia: null,
  mahasiswa: null,
  ormawa: "ormawa",
  universitas: "universitas",
};

export function levelsForScope(scope: ProposalScope): ApprovalLevel[] {
  if (scope === "ormawa") {
    return ["ormawa"];
  }
  if (scope === "fakultas") {
    return ["ormawa", "fakultas"];
  }
  return ["ormawa", "fakultas", "universitas"];
}

export function deriveLevelStates(
  scope: ProposalScope,
  approvals: ProposalApproval[],
  currentRound: number
): DerivedLevel[] {
  const levels = levelsForScope(scope);
  const roundApprovals = approvals.filter(
    (approval) => approval.submissionRound === currentRound
  );
  let activeFound = false;

  return levels.map((level) => {
    const approval = roundApprovals.find((item) => item.level === level);
    if (approval) {
      return { approval, level, state: "done" };
    }
    if (!activeFound) {
      activeFound = true;
      return { level, state: "active" };
    }
    return { level, state: "queued" };
  });
}

export function canReview(userRole: string, states: DerivedLevel[]): boolean {
  if (!isReviewRole(userRole)) {
    return false;
  }
  const active = states.find((state) => state.state === "active");
  return active?.level === ROLE_TO_LEVEL[userRole];
}

export function activeReviewLevel(
  states: DerivedLevel[]
): ApprovalLevel | null {
  return states.find((state) => state.state === "active")?.level ?? null;
}

function isReviewRole(role: string): role is UserRole {
  return role in ROLE_TO_LEVEL;
}
