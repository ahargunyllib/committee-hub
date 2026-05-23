import type { DB } from "../../db";
import { notImplemented } from "../../lib/stub";
import type { Proposal, ProposalApproval } from "./proposal.schema";

export type ListProposalsInput = {
  scope?: Proposal["scope"];
  status?: Proposal["status"];
  submittedById?: string;
};

export type CreateProposalInput = {
  description?: string;
  documentUrl?: string;
  eventId: string;
  scope: Proposal["scope"];
  submittedById: string;
  title: string;
};

export type UpdateProposalInput = Partial<
  Pick<CreateProposalInput, "description" | "documentUrl" | "scope" | "title">
>;

export type ReviewProposalInput = {
  decision: ProposalApproval["decision"];
  level: ProposalApproval["level"];
  notes?: string;
  reviewerId: string;
};

export type ProposalRepository = {
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

export const createProposalRepository = (_db: DB): ProposalRepository => ({
  // Query proposals by reviewer-facing filters such as status, scope, and submitter.
  listProposals: (_input) =>
    notImplemented("proposal.repository.listProposals"),
  // Insert the proposal linked to one event and submitter; unique event FK keeps one proposal per event.
  createProposal: (_input) =>
    notImplemented("proposal.repository.createProposal"),
  // Fetch one proposal by primary key; service decides whether null becomes not-found.
  getProposalById: (_proposalId) =>
    notImplemented("proposal.repository.getProposalById"),
  // Apply revisions to draft/revision-requested proposal fields before resubmission.
  updateProposal: (_proposalId, _input) =>
    notImplemented("proposal.repository.updateProposal"),
  // Move a proposal into pending review and increment submission round when resubmitting.
  submitProposal: (_proposalId) =>
    notImplemented("proposal.repository.submitProposal"),
  // Insert approval history and update proposal status in one transaction.
  reviewProposal: (_proposalId, _input) =>
    notImplemented("proposal.repository.reviewProposal"),
  // Return full approval history ordered by submission round and creation time.
  listApprovals: (_proposalId) =>
    notImplemented("proposal.repository.listApprovals"),
});
