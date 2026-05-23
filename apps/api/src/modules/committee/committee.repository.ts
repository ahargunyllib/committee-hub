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
  listDivisionsByEvent: (_eventId) =>
    notImplemented("committee.repository.listDivisionsByEvent"),
  createDivision: (_input) =>
    notImplemented("committee.repository.createDivision"),
  updateDivision: (_divisionId, _input) =>
    notImplemented("committee.repository.updateDivision"),
  createApplication: (_input) =>
    notImplemented("committee.repository.createApplication"),
  listApplicationsByDivision: (_divisionId) =>
    notImplemented("committee.repository.listApplicationsByDivision"),
  reviewApplication: (_applicationId, _input) =>
    notImplemented("committee.repository.reviewApplication"),
});
