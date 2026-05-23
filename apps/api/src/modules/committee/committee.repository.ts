import type { DB } from "../../db";
import { notImplemented } from "../../lib/stub";
import type { CommitteeApplication, Division } from "./committee.schema";

export type CreateDivisionInput = {
  description?: string;
  eventId: string;
  name: string;
  quota: number;
};

export type UpdateDivisionInput = Partial<Omit<CreateDivisionInput, "eventId">>;

export type CreateCommitteeApplicationInput = {
  divisionId: string;
  motivation?: string;
  userId: string;
};

export type ReviewCommitteeApplicationInput = {
  reviewerId: string;
  status: Extract<CommitteeApplication["status"], "accepted" | "rejected">;
};

export type CommitteeRepository = {
  listDivisionsByEvent: (eventId: string) => Promise<Division[]>;
  createDivision: (input: CreateDivisionInput) => Promise<Division>;
  updateDivision: (
    divisionId: string,
    input: UpdateDivisionInput
  ) => Promise<Division>;
  createApplication: (
    input: CreateCommitteeApplicationInput
  ) => Promise<CommitteeApplication>;
  listApplicationsByDivision: (
    divisionId: string
  ) => Promise<CommitteeApplication[]>;
  reviewApplication: (
    applicationId: string,
    input: ReviewCommitteeApplicationInput
  ) => Promise<CommitteeApplication>;
};

export const createCommitteeRepository = (_db: DB): CommitteeRepository => ({
  // Read divisions owned by an event; event existence can be enforced by FK or checked for a better error.
  listDivisionsByEvent: (_eventId) =>
    notImplemented("committee.repository.listDivisionsByEvent"),
  // Insert a division for an event and let the event/name unique index prevent duplicates.
  createDivision: (_input) =>
    notImplemented("committee.repository.createDivision"),
  // Update mutable division fields while preserving the event boundary.
  updateDivision: (_divisionId, _input) =>
    notImplemented("committee.repository.updateDivision"),
  // Insert an application and let the division/user unique index prevent duplicate applications.
  createApplication: (_input) =>
    notImplemented("committee.repository.createApplication"),
  // List applicants for a division; join user details here if the review UI needs them.
  listApplicationsByDivision: (_divisionId) =>
    notImplemented("committee.repository.listApplicationsByDivision"),
  // Update review status, reviewer, and timestamp in one write; service emits notification after success.
  reviewApplication: (_applicationId, _input) =>
    notImplemented("committee.repository.reviewApplication"),
});
