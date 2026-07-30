/**
 * Data access layer. Development/demo runs against the in-memory seed store
 * (no external services); production swaps these reads to Drizzle/Neon
 * behind the same function signatures. Booking mutations go through
 * src/lib/booking which owns state transitions and capacity rules.
 */

import { seed } from "@/data/seed";
import { clusterById, publishedArticles } from "@/lib/editorial/store";
import type {
  BlogPost,
  Booking,
  ClassSlot,
  ConnectStatus,
  Listing,
  Organisation,
  Provider,
  StartPath,
} from "@/lib/types";

/** PAY-3/PAY-4: mutable Connect lifecycle state layered over the seed. */
interface ConnectOverride {
  connectStatus?: ConnectStatus;
  connectAccountId?: string | null;
}

/** Mutable demo state survives HMR by living on globalThis. */
interface Store {
  bookedDeltas: Map<string, number>;
  bookings: Booking[];
  extraSlots: ClassSlot[];
  removedSlotIds: Set<string>;
  capacityOverrides: Map<string, number>;
  /** BKG-20 outbound-contact counter — the ONLY thing recorded (PAY-17a). */
  outboundContacts: Map<string, number>;
  connectOverrides: Map<string, ConnectOverride>;
  /** ING-7: providers removed via the opt-out flow disappear from all reads. */
  suppressedProviderIds: Set<string>;
  /** PRO-2: permanent old-slug → provider mappings. */
  slugRedirects: Map<string, string>;
}

const globalStore = globalThis as unknown as { __theYogaUniverseStore?: Store };

function store(): Store {
  globalStore.__theYogaUniverseStore ??= {
    bookedDeltas: new Map(),
    bookings: [],
    extraSlots: [],
    removedSlotIds: new Set(),
    capacityOverrides: new Map(),
    outboundContacts: new Map(),
    connectOverrides: new Map(),
    suppressedProviderIds: new Set(),
    slugRedirects: new Map(),
  };
  // A store created before these fields existed can survive HMR without them.
  globalStore.__theYogaUniverseStore.connectOverrides ??= new Map();
  globalStore.__theYogaUniverseStore.suppressedProviderIds ??= new Set();
  globalStore.__theYogaUniverseStore.slugRedirects ??= new Map();
  return globalStore.__theYogaUniverseStore;
}

/* --------------------------------- reads ---------------------------------- */

export function allProviders(): Provider[] {
  const suppressed = store().suppressedProviderIds;
  return seed.providers.filter((p) => !suppressed.has(p.id));
}

export function providerBySlug(slug: string): Provider | undefined {
  const provider = seed.providers.find((p) => p.slug === slug);
  return provider && !store().suppressedProviderIds.has(provider.id) ? provider : undefined;
}

export function providerByOldSlug(slug: string): Provider | undefined {
  const providerId = store().slugRedirects.get(slug);
  return providerId ? providerById(providerId) : undefined;
}

export function providerById(id: string): Provider | undefined {
  const provider = seed.providers.find((p) => p.id === id);
  return provider && !store().suppressedProviderIds.has(id) ? provider : undefined;
}

export function providersByCity(citySlug: string): Provider[] {
  const suppressed = store().suppressedProviderIds;
  return seed.providers.filter((p) => p.citySlug === citySlug && !suppressed.has(p.id));
}

export function featuredProviders(): Provider[] {
  const suppressed = store().suppressedProviderIds;
  return seed.providers.filter((p) => p.featured && !suppressed.has(p.id));
}

export function organisationById(id: string): Organisation | undefined {
  const org = seed.organisations.get(id);
  if (!org) return undefined;
  const override = store().connectOverrides.get(id);
  if (!override) return org;
  return {
    ...org,
    payoutEligibility: {
      ...org.payoutEligibility,
      connectStatus: override.connectStatus ?? org.payoutEligibility.connectStatus,
      connectAccountId:
        override.connectAccountId !== undefined
          ? override.connectAccountId
          : org.payoutEligibility.connectAccountId,
    },
  };
}

/** PAY-4: Connect webhooks arrive keyed by the Stripe account id. */
export function organisationByConnectAccount(accountId: string): Organisation | undefined {
  for (const id of seed.organisations.keys()) {
    const org = organisationById(id);
    if (org?.payoutEligibility.connectAccountId === accountId) return org;
  }
  return undefined;
}

/**
 * PAY-3/PAY-4: Connect lifecycle transitions (onboarding started, account
 * verified, restricted, disabled). Transactability picks the new status up
 * on the next evaluation — nothing else to invalidate (DM-7).
 */
export function updateOrganisationConnect(
  organisationId: string,
  patch: ConnectOverride,
): Organisation | undefined {
  if (!seed.organisations.has(organisationId)) return undefined;
  const s = store();
  s.connectOverrides.set(organisationId, {
    ...s.connectOverrides.get(organisationId),
    ...patch,
  });
  return organisationById(organisationId);
}

export function primaryListingOf(providerId: string): Listing | undefined {
  return seed.listings.find((l) => l.providerId === providerId);
}

export function listingById(id: string): Listing | undefined {
  return seed.listings.find((l) => l.id === id);
}

/** Live slots for a provider: seed slots + provider-added, with booking deltas applied. */
export function slotsForProvider(providerId: string): ClassSlot[] {
  const s = store();
  if (s.suppressedProviderIds.has(providerId)) return [];
  return [...seed.slots, ...s.extraSlots]
    .filter((slot) => slot.providerId === providerId && !s.removedSlotIds.has(slot.id))
    .map((slot) => ({
      ...slot,
      capacity: s.capacityOverrides.get(slot.id) ?? slot.capacity,
      booked: slot.booked + (s.bookedDeltas.get(slot.id) ?? 0),
    }));
}

export function slotById(slotId: string): ClassSlot | undefined {
  const s = store();
  if (s.removedSlotIds.has(slotId)) return undefined;
  const slot = [...seed.slots, ...s.extraSlots].find((x) => x.id === slotId);
  if (!slot) return undefined;
  return {
    ...slot,
    capacity: s.capacityOverrides.get(slot.id) ?? slot.capacity,
    booked: slot.booked + (s.bookedDeltas.get(slot.id) ?? 0),
  };
}

/**
 * Legacy teaser adapter over the BLG editorial store (src/lib/editorial).
 * Home-page teasers and start-here paths keep the BlogPost shape; the blog
 * routes themselves render full Articles.
 */
export function posts(): BlogPost[] {
  return publishedArticles().map((article) => {
    const cluster = clusterById(article.clusterId);
    return {
      id: article.slug,
      category: (cluster?.name ?? "Guide").toUpperCase(),
      title: article.title,
      excerpt: article.excerpt,
      meta: `${article.minutes} min read · Updated ${article.dateModified}`,
      tint: article.tint,
      body: article.sections.flatMap((s) => s.paragraphs),
    };
  });
}

export function postById(id: string): BlogPost | undefined {
  return posts().find((p) => p.id === id);
}

export function startPaths(): StartPath[] {
  return seed.startPaths;
}

export function bookingsAll(): Booking[] {
  return store().bookings;
}

export function bookingsForProvider(providerId: string): Booking[] {
  return store().bookings.filter((b) => b.providerId === providerId);
}

export function bookingByReference(reference: string): Booking | undefined {
  return store().bookings.find((b) => b.reference === reference);
}

/** PAY-20: webhook events (disputes, refunds) arrive keyed by payment intent. */
export function bookingByPaymentIntent(intentRef: string): Booking | undefined {
  return store().bookings.find((b) => b.paymentIntentRef === intentRef);
}

/* -------------------------------- mutations -------------------------------- */

/**
 * Capacity decrement — the seed-store analogue of the transactional
 * decrement required by BKG-19. The DB implementation uses
 * `UPDATE … SET booked = booked + 1 WHERE booked < capacity` semantics.
 */
export function reserveSeat(slotId: string): boolean {
  const slot = slotById(slotId);
  if (!slot || slot.booked >= slot.capacity) return false;
  const s = store();
  s.bookedDeltas.set(slotId, (s.bookedDeltas.get(slotId) ?? 0) + 1);
  return true;
}

export function releaseSeat(slotId: string): void {
  const s = store();
  s.bookedDeltas.set(slotId, (s.bookedDeltas.get(slotId) ?? 0) - 1);
}

export function insertBooking(booking: Booking): void {
  store().bookings.push(booking);
}

export function updateBooking(id: string, patch: Partial<Booking>): Booking | undefined {
  const s = store();
  const index = s.bookings.findIndex((b) => b.id === id);
  if (index === -1) return undefined;
  s.bookings[index] = { ...s.bookings[index], ...patch };
  return s.bookings[index];
}

/** PRO-2 rename transaction: the original slug is retained permanently. */
export function retainProviderSlug(oldSlug: string, providerId: string): void {
  if (!providerById(providerId)) throw new Error("Unknown provider");
  const existing = store().slugRedirects.get(oldSlug);
  if (existing && existing !== providerId) throw new Error("Slug redirect already claimed");
  store().slugRedirects.set(oldSlug, providerId);
}

/** DASH-2: provider schedule management (add/remove/capacity). */
export function addSlot(slot: ClassSlot): void {
  store().extraSlots.push(slot);
}

export function removeSlot(slotId: string): void {
  store().removedSlotIds.add(slotId);
}

/** Existing bookings are respected when capacity is lowered. */
export function setSlotCapacity(slotId: string, capacity: number): boolean {
  const slot = slotById(slotId);
  if (!slot) return false;
  store().capacityOverrides.set(slotId, Math.max(capacity, slot.booked));
  return true;
}

/**
 * ING-7 opt-out: suppressing a provider removes them from every public read
 * (directory, city hubs, profile, slots) without touching the seed record.
 * Re-ingestion is blocked separately by the tombstone in src/lib/ingestion.
 */
export function suppressProvider(providerId: string): void {
  store().suppressedProviderIds.add(providerId);
}

export function isProviderSuppressed(providerId: string): boolean {
  return store().suppressedProviderIds.has(providerId);
}

/**
 * BKG-20/PAY-17a: record THAT an outbound contact occurred — a bare counter
 * for DASH-7/ANL-2. Nothing about the message or what happened next.
 */
export function recordOutboundContact(providerId: string): void {
  const s = store();
  s.outboundContacts.set(providerId, (s.outboundContacts.get(providerId) ?? 0) + 1);
}

export function outboundContactCount(providerId: string): number {
  return store().outboundContacts.get(providerId) ?? 0;
}
