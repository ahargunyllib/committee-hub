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

  createDivision: async (input) => {
    // check quota is positive
    if (input.quota <= 0) {
      throw new Error("Division quota must be a positive number.");
    }
    return await repository.createDivision(input);
  },

  updateDivision: async (divisionId, input) => {
    // check division exists
    const division = await repository.getDivisionById(divisionId);
    if (!division) {
      throw new Error("Division not found.");
    }

    // prevent quota below accepted member count
    if (input.quota !== undefined) {
      const applications =
        await repository.listApplicationsByDivision(divisionId);
      const acceptedCount = applications.filter(
        (app) => app.status === "accepted"
      ).length;

      if (input.quota < acceptedCount) {
        throw new Error(
          `Cannot reduce quota below current accepted members (${acceptedCount}).`
        );
      }
    }

    return repository.updateDivision(divisionId, input);
  },

  createApplication: async (input) => {
    // check user has not already applied to this division
    const existingApps = await repository.listApplicationsByDivision(
      input.divisionId
    );
    if (existingApps.some((app) => app.userId === input.userId)) {
      throw new Error("User has already applied to this division.");
    }

    return repository.createApplication(input);
  },

  listApplicationsByDivision: (divisionId) =>
    repository.listApplicationsByDivision(divisionId),

  reviewApplication: async (applicationId, input) => {
    // check application exists
    const currentApp = await repository.getApplicationById(applicationId);
    if (!currentApp) {
      throw new Error("Application not found.");
    }

    // check application is still pending
    if (currentApp.status !== "pending") {
      throw new Error(`Application has already been ${currentApp.status}.`);
    }

    // if accepting, check division quota belum penuh
    if (input.status === "accepted") {
      const division = await repository.getDivisionById(currentApp.divisionId);
      if (!division) {
        throw new Error("Associated division not found.");
      }

      const applications = await repository.listApplicationsByDivision(
        currentApp.divisionId
      );
      const acceptedCount = applications.filter(
        (app) => app.status === "accepted"
      ).length;

      if (acceptedCount >= division.quota) {
        throw new Error("Division quota is already full.");
      }
    }

    // update application review fields atomically
    const application = await repository.reviewApplication(
      applicationId,
      input
    );

    // emit side-effect for notifications
    appEvents.emit("committee.applicationReviewed", {
      applicationId,
      recipientUserId: application.userId,
      status: input.status,
    });

    return application;
  },
});
