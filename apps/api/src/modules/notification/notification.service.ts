import {
  appEvents,
  type CommitteeApplicationReviewedEvent,
  type EventRegistrationCreatedEvent,
  type ProposalStatusChangedEvent,
} from "../../lib/events";
import { logger } from "../../lib/logger";
import type {
  CreateNotificationInput,
  ListNotificationsInput,
  NotificationRepository,
} from "./notification.repository";
import type { Notification } from "./notification.schema";

const proposalNotificationTypeByStatus = {
  approved: "proposal_approved",
  rejected: "proposal_rejected",
  revision_requested: "proposal_revision_requested",
} as const;

export type NotificationService = {
  listNotifications: (input: ListNotificationsInput) => Promise<Notification[]>;
  createNotification: (input: CreateNotificationInput) => Promise<Notification>;
  markAsRead: (notificationId: string, userId: string) => Promise<Notification>;
  markAllAsRead: (userId: string) => Promise<{ updated: number }>;
  handleProposalStatusChanged: (
    payload: ProposalStatusChangedEvent
  ) => Promise<Notification>;
  handleCommitteeApplicationReviewed: (
    payload: CommitteeApplicationReviewedEvent
  ) => Promise<Notification>;
  handleEventRegistrationCreated: (
    payload: EventRegistrationCreatedEvent
  ) => Promise<Notification>;
};

type CreateNotificationServiceContext = {
  repository: NotificationRepository;
};

export const createNotificationService = ({
  repository,
}: CreateNotificationServiceContext): NotificationService => ({
  listNotifications: (input) => repository.listNotifications(input),
  createNotification: (input) => repository.createNotification(input),
  markAsRead: (notificationId, userId) =>
    repository.markAsRead(notificationId, userId),
  markAllAsRead: (userId) => repository.markAllAsRead(userId),
  handleProposalStatusChanged: (payload) =>
    repository.createNotification({
      message: `Proposal ${payload.status.replaceAll("_", " ")}`,
      referenceId: payload.proposalId,
      referenceType: "proposal",
      type: proposalNotificationTypeByStatus[payload.status],
      userId: payload.recipientUserId,
    }),
  handleCommitteeApplicationReviewed: (payload) =>
    repository.createNotification({
      message: `Committee application ${payload.status}`,
      referenceId: payload.applicationId,
      referenceType: "committee_application",
      type:
        payload.status === "accepted"
          ? "application_accepted"
          : "application_rejected",
      userId: payload.recipientUserId,
    }),
  handleEventRegistrationCreated: (payload) =>
    repository.createNotification({
      message: "Event registration successful",
      referenceId: payload.registrationId,
      referenceType: "registration",
      type: "registration_success",
      userId: payload.recipientUserId,
    }),
});

export const registerNotificationListeners = (
  service: NotificationService
): void => {
  appEvents.on("proposal.statusChanged", (payload) => {
    service.handleProposalStatusChanged(payload).catch((error: unknown) => {
      logger.warn({ error }, "Notification listener failed");
    });
  });

  appEvents.on("committee.applicationReviewed", (payload) => {
    service
      .handleCommitteeApplicationReviewed(payload)
      .catch((error: unknown) => {
        logger.warn({ error }, "Notification listener failed");
      });
  });

  appEvents.on("event.registrationCreated", (payload) => {
    service.handleEventRegistrationCreated(payload).catch((error: unknown) => {
      logger.warn({ error }, "Notification listener failed");
    });
  });
};
