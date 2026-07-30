CREATE TYPE "public"."booking_state" AS ENUM('pending', 'confirmed', 'attended', 'no_show', 'cancelled_by_user', 'cancelled_by_provider', 'refunded', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."connect_status" AS ENUM('none', 'onboarding', 'active', 'restricted', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."credential_status" AS ENUM('self_declared', 'pending_review', 'verified', 'lapsed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."enquiry_kind" AS ENUM('managed', 'forwarded');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('draft', 'published', 'paused', 'archived');--> statement-breakpoint
CREATE TYPE "public"."listing_type" AS ENUM('recurring_class', 'workshop', 'course', 'retreat', 'teacher_training', 'private_session', 'on_demand', 'venue');--> statement-breakpoint
CREATE TYPE "public"."occurrence_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show_resolved');--> statement-breakpoint
CREATE TYPE "public"."provenance" AS ENUM('seeded', 'claimed', 'native');--> statement-breakpoint
CREATE TYPE "public"."provider_kind" AS ENUM('teacher', 'studio', 'school', 'organiser', 'venue');--> statement-breakpoint
CREATE TYPE "public"."supply_type" AS ENUM('in_person', 'online_live', 'on_demand');--> statement-breakpoint
CREATE TYPE "public"."verification_tier" AS ENUM('self_declared', 'document_verified', 'registry_verified');--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_transitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"from_state" "booking_state",
	"to_state" "booking_state" NOT NULL,
	"actor" text NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"occurrence_id" uuid NOT NULL,
	"listing_id" uuid NOT NULL,
	"user_account_id" uuid,
	"guest_name" text NOT NULL,
	"guest_email" text NOT NULL,
	"state" "booking_state" DEFAULT 'pending' NOT NULL,
	"price_amount" integer,
	"price_currency" char(3),
	"commission_bps" integer,
	"commission_amount" integer,
	"policy_snapshot" jsonb,
	"waiver_signature_id" uuid,
	"idempotency_key" text,
	"checkin_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"registry" text,
	"registry_id" text,
	"label" text NOT NULL,
	"status" "credential_status" DEFAULT 'self_declared' NOT NULL,
	"document_ref" text,
	"expires_at" timestamp with time zone,
	"last_checked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "enquiry_kind" NOT NULL,
	"provider_id" uuid NOT NULL,
	"listing_id" uuid,
	"user_account_id" uuid,
	"message" text,
	"responded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingestion_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_url" text NOT NULL,
	"agent_version" text NOT NULL,
	"entity_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"field_provenance" jsonb NOT NULL,
	"confidence_score" real NOT NULL,
	"status" text DEFAULT 'staged' NOT NULL,
	"resolved_provider_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"account" text NOT NULL,
	"organisation_id" uuid,
	"booking_id" uuid,
	"direction" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" char(3) NOT NULL,
	"memo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"organisation_id" uuid NOT NULL,
	"type" "listing_type" NOT NULL,
	"supply_type" "supply_type",
	"performance_country" char(2),
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"status" "listing_status" DEFAULT 'draft' NOT NULL,
	"visibility" text DEFAULT 'public' NOT NULL,
	"scheduled_publish_at" timestamp with time zone,
	"rrule" text,
	"exdates" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"duration_minutes" integer,
	"timezone" text,
	"price_amount" integer,
	"price_currency" char(3),
	"indicative_low_amount" integer,
	"indicative_high_amount" integer,
	"indicative_currency" char(3),
	"donation_based" boolean DEFAULT false NOT NULL,
	"default_capacity" integer,
	"styles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"levels" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"booking_mode" text DEFAULT 'instant_book' NOT NULL,
	"cancellation_policy" jsonb,
	"taxonomy_version" text DEFAULT '' NOT NULL,
	"provenance" "provenance" DEFAULT 'native' NOT NULL,
	"confidence_score" real DEFAULT 1 NOT NULL,
	"last_verified_at" timestamp with time zone,
	"source_ref" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "occurrences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"starts_at_utc" timestamp with time zone NOT NULL,
	"ends_at_utc" timestamp with time zone NOT NULL,
	"timezone" text NOT NULL,
	"status" "occurrence_status" DEFAULT 'scheduled' NOT NULL,
	"capacity" integer NOT NULL,
	"booked" integer DEFAULT 0 NOT NULL,
	"waitlist_limit" integer,
	"teacher_provider_id" uuid,
	"substitute_provider_id" uuid,
	"room" text,
	"price_override_amount" integer,
	"price_override_currency" char(3),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "organisation_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation_id" uuid NOT NULL,
	"user_account_id" uuid NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "organisations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"domicile_country" char(2) NOT NULL,
	"connect_status" "connect_status" DEFAULT 'none' NOT NULL,
	"connect_account_id" text,
	"commission_override_bps" integer,
	"provenance" "provenance" DEFAULT 'native' NOT NULL,
	"confidence_score" real DEFAULT 1 NOT NULL,
	"last_verified_at" timestamp with time zone,
	"source_ref" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"provider" text DEFAULT 'stripe' NOT NULL,
	"intent_ref" text,
	"amount" integer NOT NULL,
	"currency" char(3) NOT NULL,
	"held_until" timestamp with time zone,
	"released_at" timestamp with time zone,
	"status" text DEFAULT 'pending' NOT NULL,
	"buyer_country" char(2),
	"location_evidence" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "persons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_name" text NOT NULL,
	"pronouns" text,
	"provenance" "provenance" DEFAULT 'native' NOT NULL,
	"confidence_score" real DEFAULT 1 NOT NULL,
	"last_verified_at" timestamp with time zone,
	"source_ref" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation_id" uuid NOT NULL,
	"person_id" uuid,
	"kind" "provider_kind" NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"city_slug" text,
	"country" char(2),
	"online_only" boolean DEFAULT false NOT NULL,
	"tagline" text,
	"short_bio" text,
	"bio" text,
	"philosophy" text,
	"address" text,
	"geo_lat" real,
	"geo_lng" real,
	"styles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"levels" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"specialisms" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"format" text DEFAULT 'in_person' NOT NULL,
	"years_running" integer,
	"facts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"socials" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"verification_tier" "verification_tier" DEFAULT 'self_declared' NOT NULL,
	"completeness_score" real DEFAULT 0 NOT NULL,
	"contact_email" text,
	"contact_phone" text,
	"website" text,
	"claimed_at" timestamp with time zone,
	"provenance" "provenance" DEFAULT 'native' NOT NULL,
	"confidence_score" real DEFAULT 1 NOT NULL,
	"last_verified_at" timestamp with time zone,
	"source_ref" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"listing_id" uuid NOT NULL,
	"teacher_provider_id" uuid,
	"studio_provider_id" uuid,
	"ratings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"text" text NOT NULL,
	"language" text,
	"provider_reply" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "slug_redirects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "provider_kind" NOT NULL,
	"old_slug" text NOT NULL,
	"provider_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppression_list" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_key" text NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teaches_at" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_provider_id" uuid NOT NULL,
	"studio_provider_id" uuid NOT NULL,
	"confirmed_by_teacher_at" timestamp with time zone,
	"confirmed_by_studio_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid,
	"clerk_user_id" text,
	"email" text NOT NULL,
	"email_verified_at" timestamp with time zone,
	"preferred_locale" text,
	"home_city_slug" text,
	"timezone" text,
	"billing_country" char(2),
	"health_notes_ciphertext" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "waiver_signatures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"signed_name" text NOT NULL,
	"signed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text
);
--> statement-breakpoint
CREATE TABLE "waiver_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation_id" uuid,
	"us_state" char(2),
	"version" text NOT NULL,
	"content" text NOT NULL,
	"counsel_approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking_transitions" ADD CONSTRAINT "booking_transitions_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_occurrence_id_occurrences_id_fk" FOREIGN KEY ("occurrence_id") REFERENCES "public"."occurrences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_account_id_user_accounts_id_fk" FOREIGN KEY ("user_account_id") REFERENCES "public"."user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_user_account_id_user_accounts_id_fk" FOREIGN KEY ("user_account_id") REFERENCES "public"."user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_records" ADD CONSTRAINT "ingestion_records_resolved_provider_id_providers_id_fk" FOREIGN KEY ("resolved_provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_teacher_provider_id_providers_id_fk" FOREIGN KEY ("teacher_provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_substitute_provider_id_providers_id_fk" FOREIGN KEY ("substitute_provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisation_members" ADD CONSTRAINT "organisation_members_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisation_members" ADD CONSTRAINT "organisation_members_user_account_id_user_accounts_id_fk" FOREIGN KEY ("user_account_id") REFERENCES "public"."user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_teacher_provider_id_providers_id_fk" FOREIGN KEY ("teacher_provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_studio_provider_id_providers_id_fk" FOREIGN KEY ("studio_provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slug_redirects" ADD CONSTRAINT "slug_redirects_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teaches_at" ADD CONSTRAINT "teaches_at_teacher_provider_id_providers_id_fk" FOREIGN KEY ("teacher_provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teaches_at" ADD CONSTRAINT "teaches_at_studio_provider_id_providers_id_fk" FOREIGN KEY ("studio_provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waiver_signatures" ADD CONSTRAINT "waiver_signatures_template_id_waiver_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."waiver_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waiver_templates" ADD CONSTRAINT "waiver_templates_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analytics_name_idx" ON "analytics_events" USING btree ("name","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_reference_idx" ON "bookings" USING btree ("reference");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_idem_idx" ON "bookings" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "bookings_occurrence_idx" ON "bookings" USING btree ("occurrence_id");--> statement-breakpoint
CREATE INDEX "ledger_txn_idx" ON "ledger_entries" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "ledger_org_idx" ON "ledger_entries" USING btree ("organisation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "listings_slug_idx" ON "listings" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "listings_provider_idx" ON "listings" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "listings_org_idx" ON "listings" USING btree ("organisation_id");--> statement-breakpoint
CREATE INDEX "occurrences_listing_start_idx" ON "occurrences" USING btree ("listing_id","starts_at_utc");--> statement-breakpoint
CREATE INDEX "org_members_org_idx" ON "organisation_members" USING btree ("organisation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "providers_slug_idx" ON "providers" USING btree ("kind","slug");--> statement-breakpoint
CREATE INDEX "providers_city_idx" ON "providers" USING btree ("city_slug");--> statement-breakpoint
CREATE INDEX "providers_org_idx" ON "providers" USING btree ("organisation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_booking_idx" ON "reviews" USING btree ("booking_id");--> statement-breakpoint
CREATE UNIQUE INDEX "slug_redirects_idx" ON "slug_redirects" USING btree ("kind","old_slug");--> statement-breakpoint
CREATE INDEX "teaches_at_teacher_idx" ON "teaches_at" USING btree ("teacher_provider_id");--> statement-breakpoint
CREATE INDEX "teaches_at_studio_idx" ON "teaches_at" USING btree ("studio_provider_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_accounts_email_idx" ON "user_accounts" USING btree ("email");