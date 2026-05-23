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
  createEvent: (input) => repository.createEvent(input),
  getEventById: (eventId) => repository.getEventById(eventId),
  updateEvent: (eventId, input) => repository.updateEvent(eventId, input),
  deleteEvent: (eventId) => repository.deleteEvent(eventId),
  registerParticipant: async (eventId, userId) => {
    const registration = await repository.createRegistration(eventId, userId);
    appEvents.emit("event.registrationCreated", {
      eventId,
      recipientUserId: userId,
      registrationId: registration.id,
    });
    return registration;
  },
  listRegistrations: (eventId) => repository.listRegistrations(eventId),
  verifyTicket: (ticketCode) => repository.verifyTicket(ticketCode),
});
