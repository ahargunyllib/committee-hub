import { and, eq, ilike, type SQL } from "drizzle-orm";
import type { DB } from "../../db";
import { AppError } from "../../lib/errors";
import { eventTable, registrationTable, ticketTable } from "./event.schema";
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

export const createEventRepository = (db: DB): EventRepository => ({
  // Query events with filters on columns owned by the event module.
  listEvents: async (input) => {
    const conditions: SQL[] = [];

    if (input.search) {
      conditions.push(ilike(eventTable.name, `%${input.search}%`));
    }
    if (input.status) {
      conditions.push(eq(eventTable.status, input.status));
    }
    if (input.type) {
      conditions.push(eq(eventTable.type, input.type));
    }

    return await db
      .select()
      .from(eventTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
  },

  // Insert the event. FK validation is handled inherently by PostgreSQL.
  createEvent: async (input) => {
    const [event] = await db
      .insert(eventTable)
      .values({
        ...input,
        date: new Date(input.date),
      })
      .returning();

    if (!event) {
      throw new AppError("INTERNAL_SERVER_ERROR", "Failed to create event.");
    }
    return event;
  },

  // Fetch one event by primary key
  getEventById: async (eventId) => {
    const [event] = await db
      .select()
      .from(eventTable)
      .where(eq(eventTable.id, eventId))
      .limit(1);

    return event ?? null;
  },

  // Update only mutable event fields and return the updated row.
  updateEvent: async (eventId, input) => {
    const [event] = await db
      .update(eventTable)
      .set({
        ...input,
        date: input.date ? new Date(input.date) : undefined,
      })
      .where(eq(eventTable.id, eventId))
      .returning();

    if (!event) {
      throw new AppError("NOT_FOUND", "Event not found.");
    }
    return event;
  },

  // Delete the event
  deleteEvent: async (eventId) => {
    await db.delete(eventTable).where(eq(eventTable.id, eventId));
    return { deleted: true };
  },

  // Create registration and ticket in one transaction
  // Completely refactored to handle the race condition
  createRegistration: async (eventId, userId) => {
    return await db.transaction(async (tx) => {
      // 1. Fetch event to check quota inside the transaction
      const [event] = await tx
        .select()
        .from(eventTable)
        .where(eq(eventTable.id, eventId))
        .limit(1);

      if (!event) {
        throw new AppError("NOT_FOUND", "Event not found.");
      }
      if (event.status !== "open") {
        throw new AppError("CONFLICT", "Event is not open.");
      }

      // 2. Check current registrations inside the transaction
      const currentRegistrations = await tx
        .select()
        .from(registrationTable)
        .where(eq(registrationTable.eventId, eventId));

      if (currentRegistrations.length >= event.quota) {
        throw new AppError("CONFLICT", "Event registration quota is full.");
      }

      if (currentRegistrations.some((reg) => reg.userId === userId)) {
        throw new AppError(
          "CONFLICT",
          "User is already registered for this event."
        );
      }

      // 3. Proceed with inserts
      const [registration] = await tx
        .insert(registrationTable)
        .values({ eventId, userId })
        .returning();

      if (!registration) {
        throw new AppError(
          "INTERNAL_SERVER_ERROR",
          "Failed to create registration."
        );
      }

      await tx
        .insert(ticketTable)
        .values({ registrationId: registration.id })
        .returning();

      return registration;
    });
  },

  // List registrations for one event
  listRegistrations: async (eventId) =>
    db
      .select()
      .from(registrationTable)
      .where(eq(registrationTable.eventId, eventId)),

  // Look up a unique ticket code and mark it used atomically
  verifyTicket: async (ticketCode) => {
    const [ticket] = await db
      .update(ticketTable)
      .set({
        status: "used",
        usedAt: new Date(),
      })
      .where(
        and(
          eq(ticketTable.code, ticketCode),
          eq(ticketTable.status, "active") // Ensure we only verify active tickets
        )
      )
      .returning();

    if (!ticket) {
      throw new AppError(
        "CONFLICT",
        "Ticket not found or already used/cancelled."
      );
    }

    return ticket;
  },
});
