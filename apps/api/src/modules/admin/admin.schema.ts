import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { userTable } from "../../db/auth.schema";
import { createId } from "../../lib/id";

export const systemConfigValueTypeEnum = pgEnum("system_config_value_type", [
  "string",
  "number",
  "boolean",
  "json",
]);

export const systemConfigTable = pgTable(
  "system_config",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId("cfg")),
    key: text("key").notNull().unique(),
    value: text("value").notNull(),
    valueType: systemConfigValueTypeEnum("value_type")
      .default("string")
      .notNull(),
    description: text("description"),
    updatedById: text("updated_by_id").references(() => userTable.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("system_config_key_idx").on(table.key)]
);

export const adminActivityLogTable = pgTable(
  "admin_activity_log",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId("act")),
    actorUserId: text("actor_user_id")
      .notNull()
      .references(() => userTable.id),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    metadata: text("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("admin_activity_actor_user_id_idx").on(table.actorUserId),
    index("admin_activity_target_idx").on(table.targetType, table.targetId),
    index("admin_activity_created_at_idx").on(table.createdAt),
  ]
);

export const systemConfigRelations = relations(
  systemConfigTable,
  ({ one }) => ({
    updatedBy: one(userTable, {
      fields: [systemConfigTable.updatedById],
      references: [userTable.id],
    }),
  })
);

export const adminActivityLogRelations = relations(
  adminActivityLogTable,
  ({ one }) => ({
    actor: one(userTable, {
      fields: [adminActivityLogTable.actorUserId],
      references: [userTable.id],
    }),
  })
);

export type SystemConfig = typeof systemConfigTable.$inferSelect;
export type AdminActivityLog = typeof adminActivityLogTable.$inferSelect;
