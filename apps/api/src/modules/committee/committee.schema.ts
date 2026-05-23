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
import { eventTable } from "../event/event.schema";
import { createId } from "../../lib/id";

export const committeeApplicationStatusEnum = pgEnum(
  "committee_application_status",
  ["pending", "accepted", "rejected"]
);

export const divisionTable = pgTable(
  "division",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId("div")),
    eventId: text("event_id")
      .notNull()
      .references(() => eventTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    quota: integer("quota").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("division_event_id_idx").on(table.eventId),
    uniqueIndex("division_event_name_idx").on(table.eventId, table.name),
  ]
);

export const committeeApplicationTable = pgTable(
  "committee_application",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId("app")),
    divisionId: text("division_id")
      .notNull()
      .references(() => divisionTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    status: committeeApplicationStatusEnum("status")
      .default("pending")
      .notNull(),
    motivation: text("motivation"),
    reviewedById: text("reviewed_by_id").references(() => userTable.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("committee_application_division_user_idx").on(
      table.divisionId,
      table.userId
    ),
    index("committee_application_division_id_idx").on(table.divisionId),
    index("committee_application_user_id_idx").on(table.userId),
    index("committee_application_status_idx").on(table.status),
  ]
);

export const divisionRelations = relations(divisionTable, ({ many, one }) => ({
  applications: many(committeeApplicationTable),
  event: one(eventTable, {
    fields: [divisionTable.eventId],
    references: [eventTable.id],
  }),
}));

export const committeeApplicationRelations = relations(
  committeeApplicationTable,
  ({ one }) => ({
    applicant: one(userTable, {
      fields: [committeeApplicationTable.userId],
      references: [userTable.id],
      relationName: "committee_applicant",
    }),
    division: one(divisionTable, {
      fields: [committeeApplicationTable.divisionId],
      references: [divisionTable.id],
    }),
    reviewer: one(userTable, {
      fields: [committeeApplicationTable.reviewedById],
      references: [userTable.id],
      relationName: "committee_reviewer",
    }),
  })
);

export type Division = typeof divisionTable.$inferSelect;
export type CommitteeApplication =
  typeof committeeApplicationTable.$inferSelect;
