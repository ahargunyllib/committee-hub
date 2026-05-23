import { appEvents } from "../../lib/events";
import type {
  CreateEventInput,
  EventRepository,
  ListEventsInput,
  UpdateEventInput,
} from "./event.repository";
import type { Event, Registration, Ticket } from "./event.schema";

export type EventService = {
  listEvents: (input: ListEventsInput) => Promise<Event[]>;
  createEvent: (input: CreateEventInput) => Promise<Event>;
  getEventById: (eventId: string) => Promise<Event | null>;
  updateEvent: (eventId: string, input: UpdateEventInput) => Promise<Event>;
  deleteEvent: (eventId: string) => Promise<{ deleted: true }>;
  registerParticipant: (
    eventId: string,
    userId: string
  ) => Promise<Registration>;
  listRegistrations: (eventId: string) => Promise<Registration[]>;
  verifyTicket: (ticketCode: string) => Promise<Ticket>;
};

type CreateEventServiceContext = {
  repository: EventRepository;
};

export const createEventService = ({
  repository,
}: CreateEventServiceContext): EventService => ({
  listEvents: (input) => repository.listEvents(input),
  // check creator exists and can create events
  // parse event date into a valid future date
  // enforce quota is positive and compatible with event type rules
  // default new events to draft until proposal approval opens them
  createEvent: (input) => repository.createEvent(input),
  getEventById: (eventId) => repository.getEventById(eventId),
  // check event exists
  // prevent reopening closed events without an explicit admin workflow
  // prevent opening an event until its proposal is approved
  // preserve immutable fields such as creator after creation
  updateEvent: (eventId, input) => repository.updateEvent(eventId, input),
  deleteEvent: (eventId) => repository.deleteEvent(eventId),
  registerParticipant: async (eventId, userId) => {
    // check event exists
    // check event is open
    // check quota belum penuh
    // check user exists
    // check user has not registered for this event
    // create registration and ticket atomically
    const registration = await repository.createRegistration(eventId, userId);
    appEvents.emit("event.registrationCreated", {
      eventId,
      recipientUserId: userId,
      registrationId: registration.id,
    });
    return registration;
  },
  listRegistrations: (eventId) => repository.listRegistrations(eventId),
  // check ticket exists
  // check ticket is active
  // check event date/status allows attendance verification
  // mark ticket used only once
  verifyTicket: (ticketCode) => repository.verifyTicket(ticketCode),
});
