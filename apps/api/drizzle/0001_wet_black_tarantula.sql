CREATE TABLE "admin_activity_log" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_user_id" text NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_activity_log" ADD CONSTRAINT "admin_activity_log_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_activity_actor_user_id_idx" ON "admin_activity_log" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "admin_activity_target_idx" ON "admin_activity_log" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "admin_activity_created_at_idx" ON "admin_activity_log" USING btree ("created_at");