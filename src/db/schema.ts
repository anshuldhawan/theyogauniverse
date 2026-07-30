/**
 * Drizzle schema — Section 6 domain model, with the non-negotiable rules:
 *
 * DM-1  teaches_at is many-to-many AND time-bounded.
 * DM-2  listings and occurrences are separate; occurrence-level overrides.
 * DM-3  provenance / confidence_score / last_verified_at / source_ref everywhere.
 * DM-4  money = integer minor units + ISO-4217 currency, never floats.
 * DM-5  timestamps UTC; occurrences also carry an IANA timezone identifier.
 * DM-6  soft-delete everywhere (deleted_at); hard delete only via GDPR workflow.
 * DM-7  transactability is DERIVED and therefore NOT a column on listings.
 *       Organisation-level components (payout eligibility) are stored; the
 *       buyer-region component is resolved per request (src/lib/transactability.ts).
 * DM-8  supply_type + performance_country on listings; enforced non-null on
 *       publish at the application layer.
 */

import {
  boolean,
  char,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/* ---------------------------------- enums --------------------------------- */

export const provenanceEnum = pgEnum("provenance", ["seeded", "claimed", "native"]);
export const verificationTierEnum = pgEnum("verification_tier", [
  "self_declared",
  "document_verified",
  "registry_verified",
]);
export const providerKindEnum = pgEnum("provider_kind", [
  "teacher",
  "studio",
  "school",
  "organiser",
  "venue",
]);
export const listingTypeEnum = pgEnum("listing_type", [
  "recurring_class",
  "workshop",
  "course",
  "retreat",
  "teacher_training",
  "private_session",
  "on_demand",
  "venue",
]);
export const listingStatusEnum = pgEnum("listing_status", [
  "draft",
  "published",
  "paused",
  "archived",
]);
export const supplyTypeEnum = pgEnum("supply_type", ["in_person", "online_live", "on_demand"]);
export const connectStatusEnum = pgEnum("connect_status", [
  "none",
  "onboarding",
  "active",
  "restricted",
  "disabled",
]);
export const occurrenceStatusEnum = pgEnum("occurrence_status", [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
  "no_show_resolved",
]);
export const bookingStateEnum = pgEnum("booking_state", [
  "pending",
  "confirmed",
  "attended",
  "no_show",
  "cancelled_by_user",
  "cancelled_by_provider",
  "refunded",
  "disputed",
]);
export const credentialStatusEnum = pgEnum("credential_status", [
  "self_declared",
  "pending_review",
  "verified",
  "lapsed",
  "rejected",
]);
export const enquiryKindEnum = pgEnum("enquiry_kind", [
  "managed", // MSG-3: transactable listings only — SLA + response tracking
  "forwarded", // BKG-20: advertising-only — forwarded, no thread, no tracking
]);
export const dataRequestStateEnum = pgEnum("data_request_state", [
  "received",
  "identity_verification",
  "in_review",
  "fulfilled",
  "partially_fulfilled",
  "denied",
]);

/* ----------------------------- shared columns ------------------------------ */

const provenanceColumns = {
  provenance: provenanceEnum("provenance").notNull().default("native"),
  confidenceScore: real("confidence_score").notNull().default(1),
  lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  sourceRef: text("source_ref"),
};

const lifecycleColumns = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }), // DM-6 soft delete
};

/* --------------------------------- people --------------------------------- */

export const persons = pgTable("persons", {
  id: uuid("id").primaryKey().defaultRandom(),
  displayName: text("display_name").notNull(),
  pronouns: text("pronouns"),
  ...provenanceColumns,
  ...lifecycleColumns,
});

export const userAccounts = pgTable(
  "user_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    personId: uuid("person_id").references(() => persons.id),
    clerkUserId: text("clerk_user_id"),
    email: text("email").notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }), // ACC-4
    preferredLocale: text("preferred_locale"),
    preferredStyles: jsonb("preferred_styles").$type<string[]>().notNull().default([]),
    experienceLevel: text("experience_level"),
    preferredLanguages: jsonb("preferred_languages").$type<string[]>().notNull().default([]),
    homeCitySlug: text("home_city_slug"),
    timezone: text("timezone"),
    billingCountry: char("billing_country", { length: 2 }), // ACC-11
    /** ACC-11: injuries/limitations — encrypted at rest with separate key scope (WVR-4). */
    healthNotesCiphertext: text("health_notes_ciphertext"),
    ...lifecycleColumns,
  },
  (t) => [uniqueIndex("user_accounts_email_idx").on(t.email)],
);

/** ACC-6: multiple vendor identities may be merged into one local account. */
export const accountIdentities = pgTable(
  "account_identities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userAccountId: uuid("user_account_id")
      .notNull()
      .references(() => userAccounts.id),
    provider: text("provider").notNull(),
    providerSubject: text("provider_subject").notNull(),
    verifiedEmail: text("verified_email"),
    ...lifecycleColumns,
  },
  (t) => [
    uniqueIndex("account_identities_provider_subject_idx").on(
      t.provider,
      t.providerSubject,
    ),
  ],
);

/** ACC-9: follows determine notification eligibility. */
export const follows = pgTable(
  "follows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userAccountId: uuid("user_account_id")
      .notNull()
      .references(() => userAccounts.id),
    subjectType: text("subject_type").notNull(), // teacher | studio | city
    subjectId: text("subject_id").notNull(),
    ...lifecycleColumns,
  },
  (t) => [
    uniqueIndex("follows_unique_idx").on(t.userAccountId, t.subjectType, t.subjectId),
  ],
);

/** ACC-10: collections are private unless a public token is explicitly set. */
export const savedCollections = pgTable("saved_collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userAccountId: uuid("user_account_id")
    .notNull()
    .references(() => userAccounts.id),
  name: text("name").notNull(),
  publicToken: text("public_token").unique(),
  ...lifecycleColumns,
});

export const savedCollectionListings = pgTable(
  "saved_collection_listings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => savedCollections.id),
    listingId: uuid("listing_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("saved_collection_listing_idx").on(t.collectionId, t.listingId)],
);

/** SRCH-9: persisted query fingerprint and deduplicated alert state. */
export const savedSearches = pgTable(
  "saved_searches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userAccountId: uuid("user_account_id")
      .notNull()
      .references(() => userAccounts.id),
    query: jsonb("query").$type<Record<string, unknown>>().notNull(),
    queryFingerprint: text("query_fingerprint").notNull(),
    channels: jsonb("channels").$type<("email" | "web_push")[]>().notNull().default([]),
    lastAlertedResultIds: jsonb("last_alerted_result_ids").$type<string[]>().notNull().default([]),
    lastEvaluatedAt: timestamp("last_evaluated_at", { withTimezone: true }),
    ...lifecycleColumns,
  },
  (t) => [uniqueIndex("saved_search_user_fingerprint_idx").on(t.userAccountId, t.queryFingerprint)],
);

/** ACC-8/DM-6: auditable self-service privacy requests; workers execute them. */
export const accountPrivacyRequests = pgTable("account_privacy_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userAccountId: uuid("user_account_id")
    .notNull()
    .references(() => userAccounts.id),
  kind: text("kind").notNull(), // export | erase
  status: text("status").notNull().default("pending"),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

/* ------------------------------ organisations ------------------------------ */

export const organisations = pgTable("organisations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  /** ACC-13: payout eligibility attaches to the Organisation, not the Person. */
  domicileCountry: char("domicile_country", { length: 2 }).notNull(),
  connectStatus: connectStatusEnum("connect_status").notNull().default("none"),
  connectAccountId: text("connect_account_id"),
  /** PAY-5: per-organisation commission override, bps; audit-logged via auditEvents. */
  commissionOverrideBps: integer("commission_override_bps"),
  ...provenanceColumns,
  ...lifecycleColumns,
});

/** ACC-12: RBAC is scoped per organisation, not per user. */
export const organisationMembers = pgTable(
  "organisation_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organisationId: uuid("organisation_id")
      .notNull()
      .references(() => organisations.id),
    userAccountId: uuid("user_account_id")
      .notNull()
      .references(() => userAccounts.id),
    role: text("role").notNull(), // owner | admin | manager | staff
    ...lifecycleColumns,
  },
  (t) => [index("org_members_org_idx").on(t.organisationId)],
);

/* -------------------------------- providers -------------------------------- */

export const providers = pgTable(
  "providers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organisationId: uuid("organisation_id")
      .notNull()
      .references(() => organisations.id),
    /** Set for teacher profiles (Person ── TeacherProfile). */
    personId: uuid("person_id").references(() => persons.id),
    kind: providerKindEnum("kind").notNull(),
    /** PRO-2: immutable once indexed; renames issue 301s via slugRedirects. */
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    citySlug: text("city_slug"),
    country: char("country", { length: 2 }),
    onlineOnly: boolean("online_only").notNull().default(false),
    tagline: text("tagline"),
    shortBio: text("short_bio"), // ≤160 chars, meta description (PRO-4)
    bio: text("bio"),
    philosophy: text("philosophy"),
    address: text("address"),
    geoLat: real("geo_lat"),
    geoLng: real("geo_lng"),
    styles: jsonb("styles").$type<string[]>().notNull().default([]),
    levels: jsonb("levels").$type<string[]>().notNull().default([]),
    languages: jsonb("languages").$type<string[]>().notNull().default([]),
    specialisms: jsonb("specialisms").$type<string[]>().notNull().default([]),
    format: text("format").notNull().default("in_person"), // in_person | online | both
    yearsRunning: integer("years_running"),
    facts: jsonb("facts").$type<{ label: string; value: string }[]>().notNull().default([]),
    socials: jsonb("socials").$type<string[]>().notNull().default([]),
    /** PRO-5/PRO-6 type-specific fields (amenities, accessibility, registry id, rooms…). */
    details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
    verificationTier: verificationTierEnum("verification_tier")
      .notNull()
      .default("self_declared"),
    /** PRO-9: completeness score, drives ranking (SRCH-14). */
    completenessScore: real("completeness_score").notNull().default(0),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    website: text("website"),
    claimedAt: timestamp("claimed_at", { withTimezone: true }),
    ...provenanceColumns,
    ...lifecycleColumns,
  },
  (t) => [
    uniqueIndex("providers_slug_idx").on(t.kind, t.slug),
    index("providers_city_idx").on(t.citySlug),
    index("providers_org_idx").on(t.organisationId),
  ],
);

/** PRO-2: renamed slugs are retained permanently and 301'd. */
export const slugRedirects = pgTable(
  "slug_redirects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: providerKindEnum("kind").notNull(),
    oldSlug: text("old_slug").notNull(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("slug_redirects_idx").on(t.kind, t.oldSlug)],
);

/** PRO-3: vanity-domain ownership and TLS provisioning state. */
export const providerDomains = pgTable(
  "provider_domains",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id),
    hostname: text("hostname").notNull(),
    verificationToken: text("verification_token").notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    tlsStatus: text("tls_status").notNull().default("pending"),
    ...lifecycleColumns,
  },
  (t) => [uniqueIndex("provider_domains_hostname_idx").on(t.hostname)],
);

/** DM-1: many-to-many, time-bounded; PRO-12: mutual confirmation, history retained. */
export const teachesAt = pgTable(
  "teaches_at",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teacherProviderId: uuid("teacher_provider_id")
      .notNull()
      .references(() => providers.id),
    studioProviderId: uuid("studio_provider_id")
      .notNull()
      .references(() => providers.id),
    confirmedByTeacherAt: timestamp("confirmed_by_teacher_at", { withTimezone: true }),
    confirmedByStudioAt: timestamp("confirmed_by_studio_at", { withTimezone: true }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    ...lifecycleColumns,
  },
  (t) => [
    index("teaches_at_teacher_idx").on(t.teacherProviderId),
    index("teaches_at_studio_idx").on(t.studioProviderId),
  ],
);

/** CRD credentials — uploads private by default (CRD-3), only the badge is public. */
export const credentials = pgTable("credentials", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id),
  kind: text("kind").notNull(), // registry | document | insurance | lineage | safeguarding
  registry: text("registry"), // yoga_alliance | yap | bwy | yoga_australia | …
  registryId: text("registry_id"),
  label: text("label").notNull(),
  status: credentialStatusEnum("status").notNull().default("self_declared"),
  documentRef: text("document_ref"), // encrypted storage ref; access audit-logged
  expiresAt: timestamp("expires_at", { withTimezone: true }), // CRD-2/CRD-5 lapse handling
  lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
  ...lifecycleColumns,
});

/** CRD-3: every read of private certificate/insurance storage is audit-logged. */
export const credentialAccessEvents = pgTable("credential_access_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  credentialId: uuid("credential_id")
    .notNull()
    .references(() => credentials.id),
  actor: text("actor").notNull(),
  purpose: text("purpose").notNull(),
  accessedAt: timestamp("accessed_at", { withTimezone: true }).notNull().defaultNow(),
});

/* --------------------------------- listings -------------------------------- */

export const listings = pgTable(
  "listings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id),
    organisationId: uuid("organisation_id")
      .notNull()
      .references(() => organisations.id),
    type: listingTypeEnum("type").notNull(),
    /** DM-8: cannot be null on a published listing (enforced on publish). */
    supplyType: supplyTypeEnum("supply_type"),
    performanceCountry: char("performance_country", { length: 2 }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    status: listingStatusEnum("status").notNull().default("draft"),
    visibility: text("visibility").notNull().default("public"), // public | unlisted | private (LST-9)
    scheduledPublishAt: timestamp("scheduled_publish_at", { withTimezone: true }),
    /** RRULE for recurring classes (SCH-1); EXDATEs in exdates. */
    rrule: text("rrule"),
    exdates: jsonb("exdates").$type<string[]>().notNull().default([]),
    durationMinutes: integer("duration_minutes"),
    timezone: text("timezone"), // IANA (DM-5)
    /** DM-4: integer minor units + currency. Exact price for bookable listings. */
    priceAmount: integer("price_amount"),
    priceCurrency: char("price_currency", { length: 3 }),
    /** LST-14: indicative range for advertising-only listings, provider's own currency. */
    indicativeLowAmount: integer("indicative_low_amount"),
    indicativeHighAmount: integer("indicative_high_amount"),
    indicativeCurrency: char("indicative_currency", { length: 3 }),
    donationBased: boolean("donation_based").notNull().default(false),
    defaultCapacity: integer("default_capacity"),
    styles: jsonb("styles").$type<string[]>().notNull().default([]),
    levels: jsonb("levels").$type<string[]>().notNull().default([]),
    /** Type-specific extensions (LST-4 rooms, LST-5 hours/accreditation, …). */
    details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
    /** BKG-1: instant_book | request_to_book. */
    bookingMode: text("booking_mode").notNull().default("instant_book"),
    /** BKG-6: policy snapshot lives on the booking; current policy here. */
    cancellationPolicy: jsonb("cancellation_policy").$type<Record<string, unknown>>(),
    taxonomyVersion: text("taxonomy_version").notNull().default(""),
    ...provenanceColumns,
    ...lifecycleColumns,
  },
  (t) => [
    uniqueIndex("listings_slug_idx").on(t.slug),
    index("listings_provider_idx").on(t.providerId),
    index("listings_org_idx").on(t.organisationId),
  ],
);

/** DM-2: occurrences are separate; per-occurrence overrides (SCH-2). */
export const occurrences = pgTable(
  "occurrences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id),
    startsAtUtc: timestamp("starts_at_utc", { withTimezone: true }).notNull(),
    endsAtUtc: timestamp("ends_at_utc", { withTimezone: true }).notNull(),
    /** DM-5: IANA identifier, not an offset. */
    timezone: text("timezone").notNull(),
    status: occurrenceStatusEnum("status").notNull().default("scheduled"),
    capacity: integer("capacity").notNull(),
    booked: integer("booked").notNull().default(0),
    waitlistLimit: integer("waitlist_limit"),
    /** SCH-2/SCH-3 overrides — null means inherit from listing. */
    teacherProviderId: uuid("teacher_provider_id").references(() => providers.id),
    substituteProviderId: uuid("substitute_provider_id").references(() => providers.id),
    room: text("room"),
    priceOverrideAmount: integer("price_override_amount"),
    priceOverrideCurrency: char("price_override_currency", { length: 3 }),
    ...lifecycleColumns,
  },
  (t) => [index("occurrences_listing_start_idx").on(t.listingId, t.startsAtUtc)],
);

/* ------------------------------ booking & money ----------------------------- */

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference").notNull(),
    occurrenceId: uuid("occurrence_id")
      .notNull()
      .references(() => occurrences.id),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id),
    userAccountId: uuid("user_account_id").references(() => userAccounts.id), // null = guest (ACC-2)
    guestName: text("guest_name").notNull(),
    guestEmail: text("guest_email").notNull(),
    state: bookingStateEnum("state").notNull().default("pending"),
    priceAmount: integer("price_amount"),
    priceCurrency: char("price_currency", { length: 3 }),
    /** PAY-5: commission rate resolved at purchase, stored immutably. */
    commissionBps: integer("commission_bps"),
    commissionAmount: integer("commission_amount"),
    /** BKG-6: policy as shown at purchase, stored immutably. */
    policySnapshot: jsonb("policy_snapshot").$type<Record<string, unknown>>(),
    waiverSignatureId: uuid("waiver_signature_id"),
    /** NFR-11: idempotency. */
    idempotencyKey: text("idempotency_key"),
    checkinAt: timestamp("checkin_at", { withTimezone: true }), // BKG-17
    ...lifecycleColumns,
  },
  (t) => [
    uniqueIndex("bookings_reference_idx").on(t.reference),
    uniqueIndex("bookings_idem_idx").on(t.idempotencyKey),
    index("bookings_occurrence_idx").on(t.occurrenceId),
  ],
);

/** BKG-18: every state transition audit-logged. */
export const bookingTransitions = pgTable("booking_transitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id),
  fromState: bookingStateEnum("from_state"),
  toState: bookingStateEnum("to_state").notNull(),
  actor: text("actor").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id),
  provider: text("provider").notNull().default("stripe"), // PAY-1 (mock in dev)
  intentRef: text("intent_ref"),
  amount: integer("amount").notNull(),
  currency: char("currency", { length: 3 }).notNull(),
  /** PAY-8: escrow — held until releaseAt (event start) for high-ticket. */
  heldUntil: timestamp("held_until", { withTimezone: true }),
  releasedAt: timestamp("released_at", { withTimezone: true }),
  status: text("status").notNull().default("pending"), // pending | captured | refunded | disputed
  buyerCountry: char("buyer_country", { length: 2 }),
  /** PAY-11: customer location evidence stored with the transaction. */
  locationEvidence: jsonb("location_evidence").$type<Record<string, string | null>>(),
  ...lifecycleColumns,
});

/**
 * PAY-14: full double-entry ledger, independent of Stripe reporting.
 * Every row is one leg; legs balance per transaction_id.
 */
export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    transactionId: uuid("transaction_id").notNull(),
    account: text("account").notNull(), // e.g. cash, platform_commission, provider_payable_held, provider_payable_available, tax_collected, refunds
    organisationId: uuid("organisation_id").references(() => organisations.id),
    bookingId: uuid("booking_id").references(() => bookings.id),
    direction: text("direction").notNull(), // debit | credit
    amount: integer("amount").notNull(),
    currency: char("currency", { length: 3 }).notNull(),
    memo: text("memo"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ledger_txn_idx").on(t.transactionId), index("ledger_org_idx").on(t.organisationId)],
);

/* ------------------------- waivers, reviews, contact ------------------------ */

/** WVR-2: immutable, versioned templates; per-US-state (WVR-1). */
export const waiverTemplates = pgTable("waiver_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  organisationId: uuid("organisation_id").references(() => organisations.id),
  usState: char("us_state", { length: 2 }),
  version: text("version").notNull(),
  content: text("content").notNull(),
  counselApprovedAt: timestamp("counsel_approved_at", { withTimezone: true }), // WVR-1 gate
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const waiverSignatures = pgTable("waiver_signatures", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: uuid("template_id")
    .notNull()
    .references(() => waiverTemplates.id),
  bookingId: uuid("booking_id").notNull(),
  signedName: text("signed_name").notNull(),
  signedAt: timestamp("signed_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
});

/** REV-1: verified-booking reviews only — bookingId is NOT NULL by design. */
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id),
    /** REV-5: independent attribution — teacher, studio and listing. */
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id),
    teacherProviderId: uuid("teacher_provider_id").references(() => providers.id),
    studioProviderId: uuid("studio_provider_id").references(() => providers.id),
    /** REV-3: multi-dimensional ratings, keyed by dimension slug. */
    ratings: jsonb("ratings").$type<Record<string, number>>().notNull().default({}),
    text: text("text").notNull(),
    language: text("language"),
    providerReply: text("provider_reply"), // REV-6
    providerRepliedAt: timestamp("provider_replied_at", { withTimezone: true }),
    editDeadline: timestamp("edit_deadline", { withTimezone: true }), // REV-7 immutable after 24h
    structuredTags: jsonb("structured_tags").$type<string[]>().notNull().default([]),
    photoRefs: jsonb("photo_refs").$type<string[]>().notNull().default([]),
    moderationStatus: text("moderation_status").notNull().default("pending"), // pending | published | rejected
    fraudScore: integer("fraud_score").notNull().default(0),
    fraudSignals: jsonb("fraud_signals").$type<string[]>().notNull().default([]),
    deletionReason: text("deletion_reason"), // REV-7: T&S reason is mandatory on deletion
    deletedBy: text("deleted_by"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...lifecycleColumns,
  },
  (t) => [uniqueIndex("reviews_booking_idx").on(t.bookingId)],
);

/**
 * Enquiries. `managed` rows (MSG-3) carry SLA tracking; `forwarded` rows
 * (BKG-20) deliberately record ONLY that an outbound contact occurred —
 * no thread, no status, no outcome (PAY-17a).
 */
export const enquiries = pgTable("enquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: enquiryKindEnum("kind").notNull(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id),
  listingId: uuid("listing_id").references(() => listings.id),
  userAccountId: uuid("user_account_id").references(() => userAccounts.id),
  /** Present for managed enquiries only; forwarded bodies are not retained after send. */
  message: text("message"),
  respondedAt: timestamp("responded_at", { withTimezone: true }), // managed only (MSG-3 SLA)
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** MSG-4/6: granular consent, one row per subject/channel/topic. */
export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userAccountId: uuid("user_account_id")
      .notNull()
      .references(() => userAccounts.id),
    channel: text("channel").notNull(), // email | web_push | sms
    topic: text("topic").notNull(), // transactional | classes | retreats | training | editorial
    enabled: boolean("enabled").notNull().default(false),
    consentedAt: timestamp("consented_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("notification_preference_scope_idx").on(t.userAccountId, t.channel, t.topic)],
);

/* ------------------------------- ops & audit ------------------------------- */

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** COMP-4: SLA-tracked data-subject rights workflow with auditable state. */
export const dataSubjectRequests = pgTable(
  "data_subject_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestType: text("request_type").notNull(),
    requesterEmail: text("requester_email").notNull(),
    detail: text("detail").notNull(),
    state: dataRequestStateEnum("state").notNull().default("received"),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    identityVerifiedAt: timestamp("identity_verified_at", { withTimezone: true }),
    decisionReason: text("decision_reason"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...lifecycleColumns,
  },
  (t) => [index("data_request_due_idx").on(t.state, t.dueAt)],
);

/** COMP-5: immutable evidence of a consent choice and policy version. */
export const consentRecords = pgTable("consent_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  userAccountId: uuid("user_account_id").references(() => userAccounts.id),
  anonymousId: text("anonymous_id"),
  policyVersion: text("policy_version").notNull(),
  analytics: boolean("analytics").notNull(),
  marketing: boolean("marketing").notNull(),
  gpcHonoured: boolean("gpc_honoured").notNull(),
  country: char("country", { length: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** COMP-8: notice-and-action intake; a final decision requires reasons. */
export const dsaNotices = pgTable(
  "dsa_notices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    targetUrl: text("target_url").notNull(),
    category: text("category").notNull(),
    explanation: text("explanation").notNull(),
    reporterEmail: text("reporter_email").notNull(),
    status: text("status").notNull().default("received"),
    statementOfReasons: text("statement_of_reasons"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    ...lifecycleColumns,
  },
  (t) => [index("dsa_notice_status_idx").on(t.status, t.createdAt)],
);

/** COMP-14/15: quarterly tax-scope attestation and exception counts. */
export const taxControlReviews = pgTable("tax_control_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  quarter: text("quarter").notNull().unique(),
  foreignTrackBDisabled: boolean("foreign_track_b_disabled").notNull(),
  foreignPerformanceListings: integer("foreign_performance_listings").notNull(),
  bundledCrossBorderRetreats: integer("bundled_cross_border_retreats").notNull(),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** COMP-16: sanctions decisions log outcome, reason and source-list version. */
export const sanctionsDecisions = pgTable(
  "sanctions_decisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectType: text("subject_type").notNull(),
    subjectRef: text("subject_ref").notNull(),
    country: char("country", { length: 2 }),
    outcome: text("outcome").notNull(),
    reasonCode: text("reason_code").notNull(),
    listVersion: text("list_version").notNull(),
    decidedBy: text("decided_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sanctions_subject_idx").on(t.subjectType, t.subjectRef)],
);

/** ING-7: permanent suppression list — removal must prevent re-ingestion. */
export const suppressionList = pgTable("suppression_list", {
  id: uuid("id").primaryKey().defaultRandom(),
  matchKey: text("match_key").notNull(), // normalised name+city / email / source URL
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** ING-1/ING-8: staged ingestion records with full per-field provenance. */
export const ingestionRecords = pgTable("ingestion_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceUrl: text("source_url").notNull(),
  agentVersion: text("agent_version").notNull(),
  entityType: text("entity_type").notNull(),
  /** Normalised candidate entity; only durable facts (ING-3). */
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  fieldProvenance: jsonb("field_provenance").$type<Record<string, unknown>>().notNull(),
  confidenceScore: real("confidence_score").notNull(),
  status: text("status").notNull().default("staged"), // staged | needs_review | published | suppressed
  resolvedProviderId: uuid("resolved_provider_id").references(() => providers.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** TSF-4: suspension/delisting and appeal state; transitions stay in auditEvents. */
export const providerSafetyCases = pgTable("provider_safety_cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id),
  standing: text("standing").notNull().default("active"), // active | suspended | delisted
  reason: text("reason").notNull(),
  evidenceRefs: jsonb("evidence_refs").$type<string[]>().notNull().default([]),
  appealStatus: text("appeal_status"), // pending | upheld | overturned
  appealStatement: text("appeal_statement"),
  openedAt: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

/** TSF-6: evidence-backed identity claims and contested ownership. */
export const providerClaimContests = pgTable("provider_claim_contests", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => providers.id),
  claimantUserId: uuid("claimant_user_id")
    .notNull()
    .references(() => userAccounts.id),
  identityMethod: text("identity_method").notNull(),
  evidenceRefs: jsonb("evidence_refs").$type<string[]>().notNull().default([]),
  status: text("status").notNull().default("pending"), // pending | verified | contested | rejected
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

/** ANL-1: governed event pipeline (thin edge table; warehouse is downstream). */
export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    /** PAY-17a boundary is enforced in src/lib/analytics.ts, not here. */
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("analytics_name_idx").on(t.name, t.createdAt)],
);

/** SEO-14: normalized observations from search-console and AI-citation adapters. */
export const seoObservations = pgTable(
  "seo_observations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").notNull(),
    query: text("query").notNull(),
    url: text("url").notNull(),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    impressions: integer("impressions").notNull().default(0),
    clicks: integer("clicks").notNull().default(0),
    position: real("position"),
    citationPresent: boolean("citation_present"),
    citedPassage: text("cited_passage"),
    competitorCitations: integer("competitor_citations"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("seo_observations_provider_date_idx").on(t.provider, t.observedAt)],
);

/* --------------------- editorial & blog module (BLG §2) -------------------- */

export const articleStateEnum = pgEnum("article_state", [
  "brief",
  "drafting",
  "editing",
  "expert_review",
  "seo_check",
  "legal_check",
  "scheduled",
  "published",
  "in_review",
  "updated",
  "retired",
]);
export const articleFormatEnum = pgEnum("article_format", [
  "pillar",
  "cluster",
  "comparison",
  "how-to",
  "explainer",
  "data-study",
  "news",
  "interview",
]);
export const reviewTierEnum = pgEnum("review_tier", ["none", "practice", "clinical"]);

/** BLG-30/61: author profiles are personal data — soft-delete, COMP-4 erasure. */
export const editorialAuthors = pgTable("editorial_authors", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  credentials: jsonb("credentials").$type<{ label: string; tier: string; issuer: string }[]>().notNull(),
  bio: text("bio").notNull(),
  sameAs: jsonb("same_as").$type<string[]>().notNull(),
  teacherProviderId: uuid("teacher_provider_id"),
  state: text("state").notNull().default("active"), // active | former
  /** BLG-61: explicit consent to a public profile, captured at onboarding. */
  profileConsentAt: timestamp("profile_consent_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const contentClusters = pgTable("content_clusters", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  pillarArticleId: uuid("pillar_article_id"),
});

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** BLG-11a: one uniqueness pool; `topics` reserved at creation. */
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    format: articleFormatEnum("format").notNull(),
    state: articleStateEnum("state").notNull().default("brief"),
    clusterId: uuid("cluster_id").notNull(),
    authorId: uuid("author_id").notNull(),
    reviewerId: uuid("reviewer_id"),
    reviewTier: reviewTierEnum("review_tier").notNull().default("none"),
    answerBlock: text("answer_block").notNull(),
    disclaimer: text("disclaimer").notNull().default("none"),
    body: jsonb("body").$type<Record<string, unknown>>().notNull(),
    faqs: jsonb("faqs").$type<Record<string, unknown>[]>().notNull(),
    sources: jsonb("sources").$type<Record<string, unknown>[]>().notNull(),
    topics: jsonb("topics").$type<string[]>().notNull(),
    datePublished: timestamp("date_published", { withTimezone: true }),
    /** BLG-4/63: moves only on substantive change, by editor declaration. */
    dateModified: timestamp("date_modified", { withTimezone: true }),
    dateReviewed: timestamp("date_reviewed", { withTimezone: true }),
    nextReviewDue: timestamp("next_review_due", { withTimezone: true }),
    aiAssisted: boolean("ai_assisted").notNull().default(false),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("articles_cluster_idx").on(t.clusterId, t.state)],
);

/** BLG-18: every workflow transition audit-logged with actor and timestamp. */
export const articleTransitions = pgTable("article_transitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  articleId: uuid("article_id").notNull(),
  fromState: articleStateEnum("from_state").notNull(),
  toState: articleStateEnum("to_state").notNull(),
  actor: text("actor").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** BLG-4/57/63: immutable revision history with the substantive-change flag. */
export const articleRevisions = pgTable("article_revisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  articleId: uuid("article_id").notNull(),
  snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
  /** Editor declaration validated against the diff — never inferred. */
  substantive: boolean("substantive").notNull(),
  editor: text("editor").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** BLG-48a: public corrections log — corrections are never silent edits. */
export const articleCorrections = pgTable("article_corrections", {
  id: uuid("id").primaryKey().defaultRandom(),
  articleId: uuid("article_id").notNull(),
  whatWasWrong: text("what_was_wrong").notNull(),
  whatChanged: text("what_changed").notNull(),
  reattestedBy: uuid("reattested_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
