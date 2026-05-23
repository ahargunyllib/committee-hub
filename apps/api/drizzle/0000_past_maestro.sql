CREATE TYPE "public"."committee_application_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('draft', 'open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('internal', 'external');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('proposal_approved', 'proposal_rejected', 'proposal_revision_requested', 'application_accepted', 'application_rejected', 'registration_success');--> statement-breakpoint
CREATE TYPE "public"."proposal_approval_level" AS ENUM('ormawa', 'fakultas', 'universitas');--> statement-breakpoint
CREATE TYPE "public"."proposal_decision" AS ENUM('approved', 'rejected', 'revision_requested');--> statement-breakpoint
CREATE TYPE "public"."proposal_scope" AS ENUM('ormawa', 'fakultas', 'universitas');--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('pending', 'approved', 'rejected', 'revision_requested');--> statement-breakpoint
CREATE TYPE "public"."system_config_value_type" AS ENUM('string', 'number', 'boolean', 'json');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('active', 'used', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('mahasiswa', 'ketua_panitia', 'ormawa', 'fakultas', 'universitas', 'admin');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "committee_application" (
	"id" text PRIMARY KEY NOT NULL,
	"division_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" "committee_application_status" DEFAULT 'pending' NOT NULL,
	"motivation" text,
	"reviewed_by_id" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "division" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"quota" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" text PRIMARY KEY NOT NULL,
	"created_by_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"date" timestamp with time zone NOT NULL,
	"location" text NOT NULL,
	"quota" integer NOT NULL,
	"type" "event_type" NOT NULL,
	"status" "event_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"reference_type" text,
	"reference_id" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposal_approval" (
	"id" text PRIMARY KEY NOT NULL,
	"proposal_id" text NOT NULL,
	"reviewer_id" text NOT NULL,
	"level" "proposal_approval_level" NOT NULL,
	"decision" "proposal_decision" NOT NULL,
	"notes" text,
	"submission_round" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposal" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"submitted_by_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"document_url" text,
	"status" "proposal_status" DEFAULT 'pending' NOT NULL,
	"scope" "proposal_scope" NOT NULL,
	"submission_round" integer DEFAULT 1 NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registration" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_config" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"value_type" "system_config_value_type" DEFAULT 'string' NOT NULL,
	"description" text,
	"updated_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "system_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "ticket" (
	"id" text PRIMARY KEY NOT NULL,
	"registration_id" text NOT NULL,
	"code" text NOT NULL,
	"status" "ticket_status" DEFAULT 'active' NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'mahasiswa' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "committee_application" ADD CONSTRAINT "committee_application_division_id_division_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."division"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "committee_application" ADD CONSTRAINT "committee_application_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "committee_application" ADD CONSTRAINT "committee_application_reviewed_by_id_user_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "division" ADD CONSTRAINT "division_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_approval" ADD CONSTRAINT "proposal_approval_proposal_id_proposal_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_approval" ADD CONSTRAINT "proposal_approval_reviewer_id_user_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_submitted_by_id_user_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration" ADD CONSTRAINT "registration_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration" ADD CONSTRAINT "registration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_config" ADD CONSTRAINT "system_config_updated_by_id_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_registration_id_registration_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "committee_application_division_user_idx" ON "committee_application" USING btree ("division_id","user_id");--> statement-breakpoint
CREATE INDEX "committee_application_division_id_idx" ON "committee_application" USING btree ("division_id");--> statement-breakpoint
CREATE INDEX "committee_application_user_id_idx" ON "committee_application" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "committee_application_status_idx" ON "committee_application" USING btree ("status");--> statement-breakpoint
CREATE INDEX "division_event_id_idx" ON "division" USING btree ("event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "division_event_name_idx" ON "division" USING btree ("event_id","name");--> statement-breakpoint
CREATE INDEX "event_created_by_id_idx" ON "event" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "event_status_idx" ON "event" USING btree ("status");--> statement-breakpoint
CREATE INDEX "event_date_idx" ON "event" USING btree ("date");--> statement-breakpoint
CREATE INDEX "notification_user_id_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_user_read_idx" ON "notification" USING btree ("user_id","read");--> statement-breakpoint
CREATE INDEX "notification_created_at_idx" ON "notification" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "proposal_approval_proposal_id_idx" ON "proposal_approval" USING btree ("proposal_id");--> statement-breakpoint
CREATE INDEX "proposal_approval_reviewer_id_idx" ON "proposal_approval" USING btree ("reviewer_id");--> statement-breakpoint
CREATE INDEX "proposal_approval_level_idx" ON "proposal_approval" USING btree ("level");--> statement-breakpoint
CREATE UNIQUE INDEX "proposal_event_id_idx" ON "proposal" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "proposal_submitted_by_id_idx" ON "proposal" USING btree ("submitted_by_id");--> statement-breakpoint
CREATE INDEX "proposal_status_idx" ON "proposal" USING btree ("status");--> statement-breakpoint
CREATE INDEX "proposal_scope_idx" ON "proposal" USING btree ("scope");--> statement-breakpoint
CREATE UNIQUE INDEX "registration_event_user_idx" ON "registration" USING btree ("event_id","user_id");--> statement-breakpoint
CREATE INDEX "registration_event_id_idx" ON "registration" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "registration_user_id_idx" ON "registration" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "session_token_idx" ON "session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "system_config_key_idx" ON "system_config" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "ticket_registration_id_idx" ON "ticket" USING btree ("registration_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ticket_code_idx" ON "ticket" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "verification_value_idx" ON "verification" USING btree ("value");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");