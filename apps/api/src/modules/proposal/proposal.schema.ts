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

export const proposalStatusEnum = pgEnum("proposal_status", [
  "pending",
  "approved",
  "rejected",
  "revision_requested",
]);

export const proposalScopeEnum = pgEnum("proposal_scope", [
  "ormawa",
  "fakultas",
  "universitas",
]);

export const proposalApprovalLevelEnum = pgEnum("proposal_approval_level", [
  "ormawa",
  "fakultas",
  "universitas",
]);

export const proposalDecisionEnum = pgEnum("proposal_decision", [
  "approved",
  "rejected",
  "revision_requested",
]);

export const proposalTable = pgTable(
  "proposal",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId("prp")),
    eventId: text("event_id")
      .notNull()
      .references(() => eventTable.id, { onDelete: "cascade" }),
    submittedById: text("submitted_by_id")
      .notNull()
      .references(() => userTable.id),
    title: text("title").notNull(),
    description: text("description"),
    documentUrl: text("document_url"),
    status: proposalStatusEnum("status").default("pending").notNull(),
    scope: proposalScopeEnum("scope").notNull(),
    submissionRound: integer("submission_round").default(1).notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("proposal_event_id_idx").on(table.eventId),
    index("proposal_submitted_by_id_idx").on(table.submittedById),
    index("proposal_status_idx").on(table.status),
    index("proposal_scope_idx").on(table.scope),
  ]
);

export const proposalApprovalTable = pgTable(
  "proposal_approval",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId("apr")),
    proposalId: text("proposal_id")
      .notNull()
      .references(() => proposalTable.id, { onDelete: "cascade" }),
    reviewerId: text("reviewer_id")
      .notNull()
      .references(() => userTable.id),
    level: proposalApprovalLevelEnum("level").notNull(),
    decision: proposalDecisionEnum("decision").notNull(),
    notes: text("notes"),
    submissionRound: integer("submission_round").default(1).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("proposal_approval_proposal_id_idx").on(table.proposalId),
    index("proposal_approval_reviewer_id_idx").on(table.reviewerId),
    index("proposal_approval_level_idx").on(table.level),
  ]
);

export const proposalRelations = relations(proposalTable, ({ many, one }) => ({
  approvals: many(proposalApprovalTable),
  event: one(eventTable, {
    fields: [proposalTable.eventId],
    references: [eventTable.id],
  }),
  submitter: one(userTable, {
    fields: [proposalTable.submittedById],
    references: [userTable.id],
  }),
}));

export const proposalApprovalRelations = relations(
  proposalApprovalTable,
  ({ one }) => ({
    proposal: one(proposalTable, {
      fields: [proposalApprovalTable.proposalId],
      references: [proposalTable.id],
    }),
    reviewer: one(userTable, {
      fields: [proposalApprovalTable.reviewerId],
      references: [userTable.id],
    }),
  })
);

export type Proposal = typeof proposalTable.$inferSelect;
export type ProposalApproval = typeof proposalApprovalTable.$inferSelect;
