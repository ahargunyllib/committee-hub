import { appEvents } from "../../lib/events";
import { AppError } from "../../lib/errors";
import type {
  CreateProposalInput,
  ListProposalsInput,
  ProposalRepository,
  ReviewProposalInput,
  UpdateProposalInput,
} from "./proposal.repository";
import type { Proposal, ProposalApproval } from "./proposal.schema";

export type ProposalService = {
  listProposals: (input: ListProposalsInput) => Promise<Proposal[]>;
  createProposal: (input: CreateProposalInput) => Promise<Proposal>;
  getProposalById: (proposalId: string) => Promise<Proposal>;
  updateProposal: (
    proposalId: string,
    actorUserId: string,
    input: UpdateProposalInput
  ) => Promise<Proposal>;
  submitProposal: (
    proposalId: string,
    actorUserId: string
  ) => Promise<Proposal>;
  reviewProposal: (
    proposalId: string,
    input: ReviewProposalInput
  ) => Promise<ProposalApproval>;
  listApprovals: (proposalId: string) => Promise<ProposalApproval[]>;
};

type CreateProposalServiceContext = {
  repository: ProposalRepository;
};

const reviewerRolesByLevel = {
  fakultas: "fakultas",
  ormawa: "ormawa",
  universitas: "universitas",
} as const satisfies Record<ProposalApproval["level"], string>;

const getExistingProposal = async (
  repository: ProposalRepository,
  proposalId: string
): Promise<Proposal> => {
  const proposal = await repository.getProposalById(proposalId);

  if (!proposal) {
    throw new AppError("NOT_FOUND", "Proposal not found");
  }

  return proposal;
};

export const createProposalService = ({
  repository,
}: CreateProposalServiceContext): ProposalService => ({
  listProposals: (input) => repository.listProposals(input),
  createProposal: async (input) => {
    const [event, submitterRole, existingProposal] = await Promise.all([
      repository.getEventById(input.eventId),
      repository.getUserRoleById(input.submittedById),
      repository.getProposalByEventId(input.eventId),
    ]);

    if (!event) {
      throw new AppError("NOT_FOUND", "Event not found");
    }

    if (event.createdById !== input.submittedById) {
      throw new AppError(
        "FORBIDDEN",
        "Only the event creator can submit a proposal for this event"
      );
    }

    if (submitterRole !== "ketua_panitia") {
      throw new AppError(
        "FORBIDDEN",
        "Only ketua_panitia users can submit proposals"
      );
    }

    if (existingProposal) {
      throw new AppError("CONFLICT", "Event already has a proposal");
    }

    return repository.createProposal(input);
  },
  getProposalById: (proposalId) => getExistingProposal(repository, proposalId),
  updateProposal: async (proposalId, actorUserId, input) => {
    const proposal = await getExistingProposal(repository, proposalId);

    if (proposal.submittedById !== actorUserId) {
      throw new AppError(
        "FORBIDDEN",
        "Only the proposal submitter can revise this proposal"
      );
    }

    if (proposal.status === "approved" || proposal.status === "rejected") {
      throw new AppError(
        "CONFLICT",
        "Approved or rejected proposals cannot be revised"
      );
    }

    if (proposal.status === "pending") {
      const approvals = await repository.listApprovals(proposalId);
      const currentRoundHasApprovals = approvals.some(
        (approval) => approval.submissionRound === proposal.submissionRound
      );

      if (currentRoundHasApprovals) {
        throw new AppError(
          "CONFLICT",
          "Pending proposals cannot be revised after review has started"
        );
      }
    }

    return repository.updateProposal(proposalId, input);
  },
  submitProposal: async (proposalId, actorUserId) => {
    const proposal = await getExistingProposal(repository, proposalId);

    if (proposal.submittedById !== actorUserId) {
      throw new AppError(
        "FORBIDDEN",
        "Only the proposal submitter can submit this proposal"
      );
    }

    return repository.submitProposal(proposalId);
  },
  reviewProposal: async (proposalId, input) => {
    const [proposalBeforeReview, reviewerRole] = await Promise.all([
      getExistingProposal(repository, proposalId),
      repository.getUserRoleById(input.reviewerId),
    ]);

    if (reviewerRole !== reviewerRolesByLevel[input.level]) {
      throw new AppError(
        "FORBIDDEN",
        "Reviewer role does not match the requested approval level"
      );
    }

    const approval = await repository.reviewProposal(proposalId, input);
    const proposalAfterReview = await repository.getProposalById(proposalId);

    if (
      proposalBeforeReview &&
      proposalAfterReview &&
      proposalAfterReview.status !== proposalBeforeReview.status &&
      proposalAfterReview.status !== "pending"
    ) {
      appEvents.emit("proposal.statusChanged", {
        proposalId,
        recipientUserId: proposalBeforeReview.submittedById,
        status: proposalAfterReview.status,
      });
    }

    return approval;
  },
  listApprovals: async (proposalId) => {
    await getExistingProposal(repository, proposalId);

    return repository.listApprovals(proposalId);
  },
});
