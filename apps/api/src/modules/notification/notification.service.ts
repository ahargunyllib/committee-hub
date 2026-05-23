import {
  appEvents,
  type CommitteeApplicationReviewedEvent,
  type EventRegistrationCreatedEvent,
  type ProposalStatusChangedEvent,
} from "../../lib/events";
import { logger } from "../../lib/logger";
import { tryCatch } from "../../lib/try-catch";
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
  // check notification belongs to user
  // ignore already-read notifications or keep operation idempotent
  // set read=true and readAt timestamp
  markAsRead: (notificationId, userId) =>
    repository.markAsRead(notificationId, userId),
  // mark only unread notifications for this user
  // return affected count for UI badge refresh
  markAllAsRead: (userId) => repository.markAllAsRead(userId),
  // map proposal status to a user-facing notification type/message
  // keep notification failure non-blocking for the originating workflow
  handleProposalStatusChanged: (payload) =>
    repository.createNotification({
      message: `Proposal ${payload.status.replaceAll("_", " ")}`,
      referenceId: payload.proposalId,
      referenceType: "proposal",
      type: proposalNotificationTypeByStatus[payload.status],
      userId: payload.recipientUserId,
    }),
  // map application decision to accepted/rejected notification
  // keep referenceId pointed at committee_application
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
  // create registration success notification with registration reference
  // future implementation may include ticket code in message metadata
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
  appEvents.on("proposal.statusChanged", async (payload) => {
    const { error } = await tryCatch(
      service.handleProposalStatusChanged(payload)
    );

    if (error) {
      logger.warn({ error }, "Notification listener failed");
    }
  });

  appEvents.on("committee.applicationReviewed", async (payload) => {
    const { error } = await tryCatch(
      service.handleCommitteeApplicationReviewed(payload)
    );

    if (error) {
      logger.warn({ error }, "Notification listener failed");
    }
  });

  appEvents.on("event.registrationCreated", async (payload) => {
    const { error } = await tryCatch(
      service.handleEventRegistrationCreated(payload)
    );

    if (error) {
      logger.warn({ error }, "Notification listener failed");
    }
  });
};
