import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { userTable } from "../../db/auth.schema";
import { createId } from "../../lib/id";

export const notificationTypeEnum = pgEnum("notification_type", [
  "proposal_approved",
  "proposal_rejected",
  "proposal_revision_requested",
  "application_accepted",
  "application_rejected",
  "registration_success",
]);

export const notificationTable = pgTable(
  "notification",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId("ntf")),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    message: text("message").notNull(),
    read: boolean("read").default(false).notNull(),
    referenceType: text("reference_type"),
    referenceId: text("reference_id"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("notification_user_id_idx").on(table.userId),
    index("notification_user_read_idx").on(table.userId, table.read),
    index("notification_created_at_idx").on(table.createdAt),
  ]
);

export const notificationRelations = relations(
  notificationTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [notificationTable.userId],
      references: [userTable.id],
    }),
  })
);

export type Notification = typeof notificationTable.$inferSelect;
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];
