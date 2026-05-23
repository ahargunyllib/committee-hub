import type { DB } from "../../db";
import { notImplemented } from "../../lib/stub";
import type { Event, Registration, Ticket } from "./event.schema";

export type ListEventsInput = {
  search?: string;
  status?: Event["status"];
  type?: Event["type"];
};

export type CreateEventInput = {
  createdById: string;
  date: string;
  description?: string;
  location: string;
  name: string;
  quota: number;
  type: Event["type"];
};

export type UpdateEventInput = Partial<
  Omit<CreateEventInput, "createdById">
> & {
  status?: Event["status"];
};

export type EventRepository = {
  listEvents: (input: ListEventsInput) => Promise<Event[]>;
  createEvent: (input: CreateEventInput) => Promise<Event>;
  getEventById: (eventId: string) => Promise<Event | null>;
  updateEvent: (eventId: string, input: UpdateEventInput) => Promise<Event>;
  deleteEvent: (eventId: string) => Promise<{ deleted: true }>;
  createRegistration: (
    eventId: string,
    userId: string
  ) => Promise<Registration>;
  listRegistrations: (eventId: string) => Promise<Registration[]>;
  verifyTicket: (ticketCode: string) => Promise<Ticket>;
};

export const createEventRepository = (_db: DB): EventRepository => ({
  // Query events with filters on columns owned by the event module.
  listEvents: (_input) => notImplemented("event.repository.listEvents"),
  // Insert the event and rely on the FK to user.id, or pre-check userTable for a friendlier creator-not-found error.
  createEvent: (_input) => notImplemented("event.repository.createEvent"),
  // Fetch one event by primary key; return null so the service can decide the API/domain error shape.
  getEventById: (_eventId) => notImplemented("event.repository.getEventById"),
  // Update only mutable event fields and return the updated row.
  updateEvent: (_eventId, _input) =>
    notImplemented("event.repository.updateEvent"),
  // Delete or soft-delete the event depending on final product policy.
  deleteEvent: (_eventId) => notImplemented("event.repository.deleteEvent"),
  // Create registration and ticket in one transaction after checking event status/quota and duplicate registration.
  createRegistration: (_eventId, _userId) =>
    notImplemented("event.repository.createRegistration"),
  // List registrations for one event, with joins to user/ticket only when the caller needs those details.
  listRegistrations: (_eventId) =>
    notImplemented("event.repository.listRegistrations"),
  // Look up a unique ticket code and mark it used atomically when attendance verification is implemented.
  verifyTicket: (_ticketCode) =>
    notImplemented("event.repository.verifyTicket"),
});
