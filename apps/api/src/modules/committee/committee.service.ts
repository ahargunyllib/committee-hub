import { appEvents } from "../../lib/events";
import type {
  CommitteeRepository,
  CreateCommitteeApplicationInput,
  CreateDivisionInput,
  ReviewCommitteeApplicationInput,
  UpdateDivisionInput,
} from "./committee.repository";
import type { CommitteeApplication, Division } from "./committee.schema";

export type CommitteeService = {
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

type CreateCommitteeServiceContext = {
  repository: CommitteeRepository;
};

export const createCommitteeService = ({
  repository,
}: CreateCommitteeServiceContext): CommitteeService => ({
  listDivisionsByEvent: (eventId) => repository.listDivisionsByEvent(eventId),
  // check event exists
  // check actor is ketua_panitia for the event
  // check division name is unique within the event
  // check quota is positive
  createDivision: (input) => repository.createDivision(input),
  // check division exists
  // check actor is ketua_panitia for the event
  // prevent quota below accepted member count
  updateDivision: (divisionId, input) =>
    repository.updateDivision(divisionId, input),
  // check division exists
  // check recruitment is open for the event
  // check user exists and is mahasiswa
  // check user has not already applied to this division
  createApplication: (input) => repository.createApplication(input),
  listApplicationsByDivision: (divisionId) =>
    repository.listApplicationsByDivision(divisionId),
  reviewApplication: async (applicationId, input) => {
    // check application exists
    // check reviewer is ketua_panitia for the event
    // check application is still pending
    // if accepting, check division quota belum penuh
    // update application review fields atomically
    const application = await repository.reviewApplication(
      applicationId,
      input
    );

    appEvents.emit("committee.applicationReviewed", {
      applicationId,
      recipientUserId: application.userId,
      status: input.status,
    });

    return application;
  },
});
