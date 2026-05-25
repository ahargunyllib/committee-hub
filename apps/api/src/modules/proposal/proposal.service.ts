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
  // check event exists
  // check submitter is ketua_panitia for the event
  // check event does not already have a proposal
  // set initial status to pending and submission round to 1
  createProposal: (input) => repository.createProposal(input),
  getProposalById: (proposalId) => repository.getProposalById(proposalId),
  // check proposal exists
  // allow revision only when status is revision_requested or pending draft policy allows it
  // preserve approval history while updating proposal fields
  updateProposal: (proposalId, input) =>
    repository.updateProposal(proposalId, input),
  // check proposal exists
  // check submitter can resubmit
  // increment submission round when resubmitting after revision
  // reset status to pending
  submitProposal: (proposalId) => repository.submitProposal(proposalId),
  reviewProposal: async (proposalId, input) => {
    // check proposal exists
    // check reviewer role matches approval level
    // check approval follows required order: ormawa -> fakultas -> universitas
    // skip universitas level when proposal scope does not require it
    // reject duplicate review for same level and submission round
    // compute next proposal status from decision and remaining levels
    // persist approval history and proposal status atomically
    const proposalBeforeReview = await repository.getProposalById(proposalId);
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
  // check proposal exists
  // return approvals ordered by submission round then createdAt
  listApprovals: (proposalId) => repository.listApprovals(proposalId),
});
