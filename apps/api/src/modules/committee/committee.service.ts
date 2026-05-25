import { appEvents } from "../../lib/events";
import { AppError } from "../../lib/errors";
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

  createDivision: async (input) => {
    // check quota is positive
    if (input.quota <= 0) {
      throw new AppError(
        "BAD_REQUEST",
        "Division quota must be a positive number."
      );
    }
    return await repository.createDivision(input);
  },

  updateDivision: async (divisionId, input) => {
    // Structural and invariant quota checks are now safely handled
    // inside the ACID transaction in the repository layer.
    return await repository.updateDivision(divisionId, input);
  },

  createApplication: async (input) => {
    // The duplicate application check is now handled securely by catching
    // the database's unique constraint violation in the repository.
    return await repository.createApplication(input);
  },

  listApplicationsByDivision: (divisionId) =>
    repository.listApplicationsByDivision(divisionId),

  reviewApplication: async (applicationId, input) => {
    // Structural, quota, and concurrency safety checks are handled atomically
    // inside the repository database transaction layer.
    const application = await repository.reviewApplication(
      applicationId,
      input
    );

    // Emit event notifications safely following successful update execution
    appEvents.emit("committee.applicationReviewed", {
      applicationId: application.id,
      status: application.status as "accepted" | "rejected",
      recipientUserId: application.userId,
    });

    return application;
  },
});
