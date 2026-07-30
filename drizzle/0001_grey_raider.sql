CREATE TYPE "public"."article_format" AS ENUM('pillar', 'cluster', 'comparison', 'how-to', 'explainer', 'data-study', 'news', 'interview');--> statement-breakpoint
CREATE TYPE "public"."article_state" AS ENUM('brief', 'drafting', 'editing', 'expert_review', 'seo_check', 'legal_check', 'scheduled', 'published', 'in_review', 'updated', 'retired');--> statement-breakpoint
CREATE TYPE "public"."review_tier" AS ENUM('none', 'practice', 'clinical');--> statement-breakpoint
CREATE TABLE "article_corrections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"what_was_wrong" text NOT NULL,
	"what_changed" text NOT NULL,
	"reattested_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"snapshot" jsonb NOT NULL,
	"substantive" boolean NOT NULL,
	"editor" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_transitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"from_state" "article_state" NOT NULL,
	"to_state" "article_state" NOT NULL,
	"actor" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"format" "article_format" NOT NULL,
	"state" "article_state" DEFAULT 'brief' NOT NULL,
	"cluster_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"reviewer_id" uuid,
	"review_tier" "review_tier" DEFAULT 'none' NOT NULL,
	"answer_block" text NOT NULL,
	"disclaimer" text DEFAULT 'none' NOT NULL,
	"body" jsonb NOT NULL,
	"faqs" jsonb NOT NULL,
	"sources" jsonb NOT NULL,
	"topics" jsonb NOT NULL,
	"date_published" timestamp with time zone,
	"date_modified" timestamp with time zone,
	"date_reviewed" timestamp with time zone,
	"next_review_due" timestamp with time zone,
	"ai_assisted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "content_clusters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"pillar_article_id" uuid,
	CONSTRAINT "content_clusters_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "editorial_authors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"credentials" jsonb NOT NULL,
	"bio" text NOT NULL,
	"same_as" jsonb NOT NULL,
	"teacher_provider_id" uuid,
	"state" text DEFAULT 'active' NOT NULL,
	"profile_consent_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "editorial_authors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "articles_cluster_idx" ON "articles" USING btree ("cluster_id","state");