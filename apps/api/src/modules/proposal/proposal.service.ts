import { appEvents } from "../../lib/events";
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
  getProposalById: (proposalId: string) => Promise<Proposal | null>;
  updateProposal: (
    proposalId: string,
    input: UpdateProposalInput
  ) => Promise<Proposal>;
  submitProposal: (proposalId: string) => Promise<Proposal>;
  reviewProposal: (
    proposalId: string,
    input: ReviewProposalInput
  ) => Promise<ProposalApproval>;
  listApprovals: (proposalId: string) => Promise<ProposalApproval[]>;
};

type CreateProposalServiceContext = {
  repository: ProposalRepository;
};

export const createProposalService = ({
  repository,
}: CreateProposalServiceContext): ProposalService => ({
  listProposals: (input) => repository.listProposals(input),
  createProposal: (input) => repository.createProposal(input),
  getProposalById: (proposalId) => repository.getProposalById(proposalId),
  updateProposal: (proposalId, input) =>
    repository.updateProposal(proposalId, input),
  submitProposal: (proposalId) => repository.submitProposal(proposalId),
  reviewProposal: async (proposalId, input) => {
    const approval = await repository.reviewProposal(proposalId, input);

    if (input.decision !== "approved") {
      appEvents.emit("proposal.statusChanged", {
        proposalId,
        recipientUserId: approval.reviewerId,
        status: input.decision,
      });
    }

    return approval;
  },
  listApprovals: (proposalId) => repository.listApprovals(proposalId),
});
