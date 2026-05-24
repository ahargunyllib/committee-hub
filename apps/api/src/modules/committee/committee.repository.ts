import { eq } from "drizzle-orm";
import type { DB } from "../../db";
import { committeeApplicationTable, divisionTable } from "./committee.schema";
import type { CommitteeApplication, Division } from "./committee.schema";

export type CreateDivisionInput = {
  description?: string;
  eventId: string;
  name: string;
  quota: number;
};

export type UpdateDivisionInput = Partial<Omit<CreateDivisionInput, "eventId">>;

export type CreateCommitteeApplicationInput = {
  divisionId: string;
  motivation?: string;
  userId: string;
};

export type ReviewCommitteeApplicationInput = {
  reviewerId: string;
  status: Extract<CommitteeApplication["status"], "accepted" | "rejected">;
};

// 1. Update the Type Definition here
export type CommitteeRepository = {
  listDivisionsByEvent: (eventId: string) => Promise<Division[]>;
  createDivision: (input: CreateDivisionInput) => Promise<Division>;
  updateDivision: (
    divisionId: string,
    input: UpdateDivisionInput
  ) => Promise<Division>;
  createApplication: (
    input: CreateCommitteeApplicationInput
  ) => Promise<CommitteeApplication>;
  listApplicationsByDivision: (
    divisionId: string
  ) => Promise<CommitteeApplication[]>;
  reviewApplication: (
    applicationId: string,
    input: ReviewCommitteeApplicationInput
  ) => Promise<CommitteeApplication>;

  // ---> NEWLY ADDED METHODS <---
  getDivisionById: (divisionId: string) => Promise<Division | null>;
  getApplicationById: (
    applicationId: string
  ) => Promise<CommitteeApplication | null>;
};

export const createCommitteeRepository = (db: DB): CommitteeRepository => ({
  // Read divisions owned by an event
  listDivisionsByEvent: async (eventId) =>
    db.select().from(divisionTable).where(eq(divisionTable.eventId, eventId)),

  // Insert a division for an event
  createDivision: async (input) => {
    const [division] = await db.insert(divisionTable).values(input).returning();

    return division;
  },

  // Update mutable division fields
  updateDivision: async (divisionId, input) => {
    const [division] = await db
      .update(divisionTable)
      .set(input)
      .where(eq(divisionTable.id, divisionId))
      .returning();

    return division;
  },

  // Insert an application
  createApplication: async (input) => {
    const [application] = await db
      .insert(committeeApplicationTable)
      .values(input)
      .returning();

    return application;
  },

  // List applicants for a division
  listApplicationsByDivision: async (divisionId) =>
    db
      .select()
      .from(committeeApplicationTable)
      .where(eq(committeeApplicationTable.divisionId, divisionId)),

  // Update review status, reviewer, and timestamp in one write
  reviewApplication: async (applicationId, input) => {
    const [application] = await db
      .update(committeeApplicationTable)
      .set({
        status: input.status,
        reviewedById: input.reviewerId,
        reviewedAt: new Date(),
      })
      .where(eq(committeeApplicationTable.id, applicationId))
      .returning();

    return application;
  },

  // 2. Add the Implementations here
  // ---> NEWLY ADDED METHODS <---
  getDivisionById: async (divisionId) => {
    const [division] = await db
      .select()
      .from(divisionTable)
      .where(eq(divisionTable.id, divisionId))
      .limit(1);
    return division ?? null;
  },

  getApplicationById: async (applicationId) => {
    const [application] = await db
      .select()
      .from(committeeApplicationTable)
      .where(eq(committeeApplicationTable.id, applicationId))
      .limit(1);
    return application ?? null;
  },
});
