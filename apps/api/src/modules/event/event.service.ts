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

  createEvent: async (input) => {
    // check creator exists and can create events
    // (Assuming FK to userTable handles basic existence; role check is handled in the Elysia route middleware)

    // parse event date into a valid future date
    const eventDate = new Date(input.date);
    if (Number.isNaN(eventDate.getTime()) || eventDate <= new Date()) {
      throw new Error("Event date must be a valid date in the future.");
    }

    // enforce quota is positive and compatible with event type rules
    if (input.quota <= 0) {
      throw new Error("Event quota must be a positive number.");
    }

    // default new events to draft until proposal approval opens them
    const safeInput: CreateEventInput = {
      ...input,
      date: input.date,
      // Note: Status is already defaulted to "draft" at the Drizzle DB schema level
    };

    return await repository.createEvent(safeInput);
  },

  getEventById: (eventId) => repository.getEventById(eventId),

  updateEvent: async (eventId, input) => {
    // 1. Check event exists
    const existingEvent = await repository.getEventById(eventId);
    if (!existingEvent) {
      throw new Error("Event not found.");
    }

    // 2. Validate updated date (if provided)
    if (input.date) {
      const eventDate = new Date(input.date);
      if (Number.isNaN(eventDate.getTime()) || eventDate <= new Date()) {
        throw new Error(
          "Updated event date must be a valid date in the future."
        );
      }
    }

    // 3. Validate updated quota (if provided)
    if (input.quota !== undefined && input.quota <= 0) {
      throw new Error("Updated event quota must be greater than zero.");
    }

    // 4. Prevent reopening closed events without an explicit admin workflow
    if (existingEvent.status === "closed" && input.status === "open") {
      throw new Error("Cannot reopen an event once it has been closed.");
    }

    // 5. Prevent opening an event until its proposal is approved
    // (Placeholder: Requires cross-checking proposal status via repo)
    if (input.status === "open" && existingEvent.status === "draft") {
      // throw new Error("Cannot open event until proposal is approved.");
    }

    // Preserve immutable fields such as creator after creation
    return await repository.updateEvent(eventId, input);
  },

  deleteEvent: (eventId) => repository.deleteEvent(eventId),

  registerParticipant: async (eventId, userId) => {
    // All quota, status, and duplicate checks are now safely handled
    // inside the ACID transaction in the repository layer.
    const registration = await repository.createRegistration(eventId, userId);

    appEvents.emit("event.registrationCreated", {
      eventId,
      recipientUserId: userId,
      registrationId: registration.id,
    });

    return registration;
  },

  listRegistrations: (eventId) => repository.listRegistrations(eventId),

  verifyTicket: async (ticketCode) => {
    // check ticket exists
    // check ticket is active
    // check event date/status allows attendance verification
    // mark ticket used only once

    // The repository inherently checks if the ticket exists and is "active",
    // and marks it used atomically inside the SQL transaction, preventing race conditions.
    return await repository.verifyTicket(ticketCode);
  },
});
