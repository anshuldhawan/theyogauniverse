CREATE TYPE "public"."data_request_state" AS ENUM('received', 'identity_verification', 'in_review', 'fulfilled', 'partially_fulfilled', 'denied');--> statement-breakpoint
CREATE TABLE "account_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_account_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_subject" text NOT NULL,
	"verified_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "account_privacy_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_account_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "consent_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_account_id" uuid,
	"anonymous_id" text,
	"policy_version" text NOT NULL,
	"analytics" boolean NOT NULL,
	"marketing" boolean NOT NULL,
	"gpc_honoured" boolean NOT NULL,
	"country" char(2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credential_access_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"credential_id" uuid NOT NULL,
	"actor" text NOT NULL,
	"purpose" text NOT NULL,
	"accessed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_subject_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_type" text NOT NULL,
	"requester_email" text NOT NULL,
	"detail" text NOT NULL,
	"state" "data_request_state" DEFAULT 'received' NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"identity_verified_at" timestamp with time zone,
	"decision_reason" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "dsa_notices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_url" text NOT NULL,
	"category" text NOT NULL,
	"explanation" text NOT NULL,
	"reporter_email" text NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"statement_of_reasons" text,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_account_id" uuid NOT NULL,
	"subject_type" text NOT NULL,
	"subject_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_account_id" uuid NOT NULL,
	"channel" text NOT NULL,
	"topic" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"consented_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_claim_contests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"claimant_user_id" uuid NOT NULL,
	"identity_method" text NOT NULL,
	"evidence_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "provider_domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"hostname" text NOT NULL,
	"verification_token" text NOT NULL,
	"verified_at" timestamp with time zone,
	"tls_status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "provider_safety_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"standing" text DEFAULT 'active' NOT NULL,
	"reason" text NOT NULL,
	"evidence_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"appeal_status" text,
	"appeal_statement" text,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sanctions_decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_type" text NOT NULL,
	"subject_ref" text NOT NULL,
	"country" char(2),
	"outcome" text NOT NULL,
	"reason_code" text NOT NULL,
	"list_version" text NOT NULL,
	"decided_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_collection_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"listing_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_account_id" uuid NOT NULL,
	"name" text NOT NULL,
	"public_token" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "saved_collections_public_token_unique" UNIQUE("public_token")
);
--> statement-breakpoint
CREATE TABLE "tax_control_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quarter" text NOT NULL,
	"foreign_track_b_disabled" boolean NOT NULL,
	"foreign_performance_listings" integer NOT NULL,
	"bundled_cross_border_retreats" integer NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tax_control_reviews_quarter_unique" UNIQUE("quarter")
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "provider_replied_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "edit_deadline" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "structured_tags" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "photo_refs" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "moderation_status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "fraud_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "fraud_signals" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "deletion_reason" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "user_accounts" ADD COLUMN "preferred_styles" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "user_accounts" ADD COLUMN "experience_level" text;--> statement-breakpoint
ALTER TABLE "user_accounts" ADD COLUMN "preferred_languages" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "account_identities" ADD CONSTRAINT "account_identities_user_account_id_user_accounts_id_fk" FOREIGN KEY ("user_account_id") REFERENCES "public"."user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_privacy_requests" ADD CONSTRAINT "account_privacy_requests_user_account_id_user_accounts_id_fk" FOREIGN KEY ("user_account_id") REFERENCES "public"."user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_user_account_id_user_accounts_id_fk" FOREIGN KEY ("user_account_id") REFERENCES "public"."user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_access_events" ADD CONSTRAINT "credential_access_events_credential_id_credentials_id_fk" FOREIGN KEY ("credential_id") REFERENCES "public"."credentials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_user_account_id_user_accounts_id_fk" FOREIGN KEY ("user_account_id") REFERENCES "public"."user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_account_id_user_accounts_id_fk" FOREIGN KEY ("user_account_id") REFERENCES "public"."user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_claim_contests" ADD CONSTRAINT "provider_claim_contests_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_claim_contests" ADD CONSTRAINT "provider_claim_contests_claimant_user_id_user_accounts_id_fk" FOREIGN KEY ("claimant_user_id") REFERENCES "public"."user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_domains" ADD CONSTRAINT "provider_domains_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_safety_cases" ADD CONSTRAINT "provider_safety_cases_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_collection_listings" ADD CONSTRAINT "saved_collection_listings_collection_id_saved_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."saved_collections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_collections" ADD CONSTRAINT "saved_collections_user_account_id_user_accounts_id_fk" FOREIGN KEY ("user_account_id") REFERENCES "public"."user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "account_identities_provider_subject_idx" ON "account_identities" USING btree ("provider","provider_subject");--> statement-breakpoint
CREATE INDEX "data_request_due_idx" ON "data_subject_requests" USING btree ("state","due_at");--> statement-breakpoint
CREATE INDEX "dsa_notice_status_idx" ON "dsa_notices" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "follows_unique_idx" ON "follows" USING btree ("user_account_id","subject_type","subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX "notification_preference_scope_idx" ON "notification_preferences" USING btree ("user_account_id","channel","topic");--> statement-breakpoint
CREATE UNIQUE INDEX "provider_domains_hostname_idx" ON "provider_domains" USING btree ("hostname");--> statement-breakpoint
CREATE INDEX "sanctions_subject_idx" ON "sanctions_decisions" USING btree ("subject_type","subject_ref");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_collection_listing_idx" ON "saved_collection_listings" USING btree ("collection_id","listing_id");