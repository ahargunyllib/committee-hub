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
  listEvents: (_input) => notImplemented("event.repository.listEvents"),
  createEvent: (_input) => notImplemented("event.repository.createEvent"),
  getEventById: (_eventId) => notImplemented("event.repository.getEventById"),
  updateEvent: (_eventId, _input) =>
    notImplemented("event.repository.updateEvent"),
  deleteEvent: (_eventId) => notImplemented("event.repository.deleteEvent"),
  createRegistration: (_eventId, _userId) =>
    notImplemented("event.repository.createRegistration"),
  listRegistrations: (_eventId) =>
    notImplemented("event.repository.listRegistrations"),
  verifyTicket: (_ticketCode) =>
    notImplemented("event.repository.verifyTicket"),
});
