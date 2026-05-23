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

export const systemConfigRelations = relations(
  systemConfigTable,
  ({ one }) => ({
    updatedBy: one(userTable, {
      fields: [systemConfigTable.updatedById],
      references: [userTable.id],
    }),
  })
);

export type SystemConfig = typeof systemConfigTable.$inferSelect;
