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
  createDivision: (input) => repository.createDivision(input),
  updateDivision: (divisionId, input) =>
    repository.updateDivision(divisionId, input),
  createApplication: (input) => repository.createApplication(input),
  listApplicationsByDivision: (divisionId) =>
    repository.listApplicationsByDivision(divisionId),
  reviewApplication: async (applicationId, input) => {
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
