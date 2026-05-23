import { EventEmitter } from "node:events";

export type ProposalStatusChangedEvent = {
  proposalId: string;
  recipientUserId: string;
  status: "approved" | "rejected" | "revision_requested";
};

export type CommitteeApplicationReviewedEvent = {
  applicationId: string;
  recipientUserId: string;
  status: "accepted" | "rejected";
};

export type EventRegistrationCreatedEvent = {
  eventId: string;
  registrationId: string;
  recipientUserId: string;
};

export type AppEventMap = {
  "proposal.statusChanged": ProposalStatusChangedEvent;
  "committee.applicationReviewed": CommitteeApplicationReviewedEvent;
  "event.registrationCreated": EventRegistrationCreatedEvent;
};

type EventListener<EventName extends keyof AppEventMap> = (
  payload: AppEventMap[EventName]
) => void;

class AppEventBus {
  private readonly emitter = new EventEmitter();

  emit<EventName extends keyof AppEventMap>(
    eventName: EventName,
    payload: AppEventMap[EventName]
  ): boolean {
    return this.emitter.emit(eventName, payload);
  }

  on<EventName extends keyof AppEventMap>(
    eventName: EventName,
    listener: EventListener<EventName>
  ): () => void {
    const wrappedListener = (payload: AppEventMap[EventName]) => {
      listener(payload);
    };

    this.emitter.on(eventName, wrappedListener as (...args: unknown[]) => void);

    return () => {
      this.emitter.off(
        eventName,
        wrappedListener as (...args: unknown[]) => void
      );
    };
  }
}

export const appEvents = new AppEventBus();
