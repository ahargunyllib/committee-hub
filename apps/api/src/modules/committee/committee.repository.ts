import { and, eq } from "drizzle-orm";
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
    if (!division) {
      throw new Error("Failed to create division.");
    }
    return division;
  },

  // Update mutable division fields
  updateDivision: async (divisionId, input) => {
    return await db.transaction(async (tx) => {
      // Validasi kuota secara atomic di dalam transaksi database
      if (input.quota !== undefined) {
        if (input.quota <= 0) {
          throw new Error("Division quota must be greater than zero.");
        }

        const acceptedApps = await tx
          .select()
          .from(committeeApplicationTable)
          .where(
            and(
              eq(committeeApplicationTable.divisionId, divisionId),
              eq(committeeApplicationTable.status, "accepted")
            )
          );

        // Mencegah Ketua Panitia menurunkan kuota lebih kecil dari jumlah anggota yang sudah diterima
        if (input.quota < acceptedApps.length) {
          throw new Error(
            "Cannot decrease quota below current accepted members."
          );
        }
      }

      // Jika aman, lakukan update
      const [division] = await tx
        .update(divisionTable)
        .set(input)
        .where(eq(divisionTable.id, divisionId))
        .returning();

      if (!division) {
        throw new Error("Failed to update division.");
      }
      return division;
    });
  },
  // Insert an application
  createApplication: async (input) => {
    try {
      const [application] = await db
        .insert(committeeApplicationTable)
        .values(input)
        .returning();

      if (!application) {
        throw new Error("Failed to create application.");
      }
      return application;
    } catch (error) {
      // Safely type-cast the error to check for the Postgres unique violation code
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "23505"
      ) {
        throw new Error("User has already applied to this division.");
      }
      throw error;
    }
  },

  // List applicants for a division
  listApplicationsByDivision: async (divisionId) =>
    db
      .select()
      .from(committeeApplicationTable)
      .where(eq(committeeApplicationTable.divisionId, divisionId)),

  // Update review status, reviewer, and timestamp in one write
  reviewApplication: async (applicationId, input) => {
    return await db.transaction(async (tx) => {
      // 1. Fetch current application state inside the transaction
      const [currentApp] = await tx
        .select()
        .from(committeeApplicationTable)
        .where(eq(committeeApplicationTable.id, applicationId))
        .limit(1);

      if (!currentApp) {
        throw new Error("Application not found.");
      }

      // 2. Prevent re-reviewing already processed applications
      if (currentApp.status !== "pending") {
        throw new Error(`Application has already been ${currentApp.status}.`);
      }

      // 3. Conditional validation for acceptance criteria
      if (input.status === "accepted") {
        const [division] = await tx
          .select()
          .from(divisionTable)
          .where(eq(divisionTable.id, currentApp.divisionId))
          .limit(1);

        if (!division) {
          throw new Error("Associated division not found.");
        }

        // Count current accepted members inside the isolated transaction
        const acceptedApps = await tx
          .select()
          .from(committeeApplicationTable)
          .where(
            and(
              eq(committeeApplicationTable.divisionId, currentApp.divisionId),
              eq(committeeApplicationTable.status, "accepted")
            )
          );

        if (acceptedApps.length >= division.quota) {
          throw new Error("Division quota is already full.");
        }
      }

      // 4. Atomic database update execution
      const [application] = await tx
        .update(committeeApplicationTable)
        .set({
          status: input.status,
          reviewedById: input.reviewerId,
          reviewedAt: new Date(),
        })
        .where(eq(committeeApplicationTable.id, applicationId))
        .returning();

      if (!application) {
        throw new Error("Failed to review application.");
      }
      return application;
    });
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
