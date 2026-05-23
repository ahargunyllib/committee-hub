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
  listProposals: (_input) =>
    notImplemented("proposal.repository.listProposals"),
  createProposal: (_input) =>
    notImplemented("proposal.repository.createProposal"),
  getProposalById: (_proposalId) =>
    notImplemented("proposal.repository.getProposalById"),
  updateProposal: (_proposalId, _input) =>
    notImplemented("proposal.repository.updateProposal"),
  submitProposal: (_proposalId) =>
    notImplemented("proposal.repository.submitProposal"),
  reviewProposal: (_proposalId, _input) =>
    notImplemented("proposal.repository.reviewProposal"),
  listApprovals: (_proposalId) =>
    notImplemented("proposal.repository.listApprovals"),
});
