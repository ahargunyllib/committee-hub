import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { userTable } from "../../db/auth.schema";
import { createId } from "../../lib/id";

export const eventTypeEnum = pgEnum("event_type", ["internal", "external"]);
export const eventStatusEnum = pgEnum("event_status", [
  "draft",
  "open",
  "closed",
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "active",
  "used",
  "cancelled",
]);

export const eventTable = pgTable(
  "event",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId("evt")),
    createdById: text("created_by_id")
      .notNull()
      .references(() => userTable.id),
    name: text("name").notNull(),
    description: text("description"),
    date: timestamp("date", { withTimezone: true }).notNull(),
    location: text("location").notNull(),
    quota: integer("quota").notNull(),
    type: eventTypeEnum("type").notNull(),
    status: eventStatusEnum("status").default("draft").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("event_created_by_id_idx").on(table.createdById),
    index("event_status_idx").on(table.status),
    index("event_date_idx").on(table.date),
  ]
);

export const registrationTable = pgTable(
  "registration",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId("reg")),
    eventId: text("event_id")
      .notNull()
      .references(() => eventTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("registration_event_user_idx").on(table.eventId, table.userId),
    index("registration_event_id_idx").on(table.eventId),
    index("registration_user_id_idx").on(table.userId),
  ]
);

export const ticketTable = pgTable(
  "ticket",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId("tkt")),
    registrationId: text("registration_id")
      .notNull()
      .references(() => registrationTable.id, { onDelete: "cascade" }),
    code: text("code")
      .notNull()
      .$defaultFn(() => createId("ticket")),
    status: ticketStatusEnum("status").default("active").notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("ticket_registration_id_idx").on(table.registrationId),
    uniqueIndex("ticket_code_idx").on(table.code),
  ]
);

export const eventRelations = relations(eventTable, ({ many, one }) => ({
  creator: one(userTable, {
    fields: [eventTable.createdById],
    references: [userTable.id],
  }),
  registrations: many(registrationTable),
}));

export const registrationRelations = relations(
  registrationTable,
  ({ one }) => ({
    event: one(eventTable, {
      fields: [registrationTable.eventId],
      references: [eventTable.id],
    }),
    ticket: one(ticketTable),
    user: one(userTable, {
      fields: [registrationTable.userId],
      references: [userTable.id],
    }),
  })
);

export const ticketRelations = relations(ticketTable, ({ one }) => ({
  registration: one(registrationTable, {
    fields: [ticketTable.registrationId],
    references: [registrationTable.id],
  }),
}));

export type Event = typeof eventTable.$inferSelect;
export type InsertEvent = typeof eventTable.$inferInsert;
export type Registration = typeof registrationTable.$inferSelect;
export type Ticket = typeof ticketTable.$inferSelect;
