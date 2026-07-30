"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { transitionBooking } from "@/lib/booking";
import { money } from "@/lib/money";
import { addSlot, bookingByReference, primaryListingOf, removeSlot, setSlotCapacity } from "@/lib/repo";
import type { BookingState, ClassSlot } from "@/lib/types";

/*
 * In production these actions run behind Clerk with canManageSchedule
 * (ACC-12); in guest/dev mode the dashboard is a demo surface over the seed
 * store, so the org-role check is a no-op.
 */

const slotSchema = z.object({
  providerId: z.string().min(1),
  day: z.string().min(2),
  time: z.string().min(2),
  what: z.string().min(2),
  where: z.string().min(2),
  capacity: z.coerce.number().int().min(1).max(500),
  priceMinor: z.coerce.number().int().min(0),
});

export async function addSlotAction(formData: FormData): Promise<void> {
  const parsed = slotSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const input = parsed.data;
  const listing = primaryListingOf(input.providerId);
  if (!listing) return;
  const slot: ClassSlot = {
    id: `${input.providerId}-${Date.now()}`,
    listingId: listing.id,
    providerId: input.providerId,
    day: input.day,
    time: input.time,
    what: input.what,
    where: input.where,
    capacity: input.capacity,
    booked: 0,
    price: input.priceMinor > 0 ? money(input.priceMinor, "USD") : null,
    timezone: "America/New_York",
  };
  addSlot(slot);
  revalidatePath("/dashboard/schedule");
}

export async function removeSlotAction(formData: FormData): Promise<void> {
  const slotId = String(formData.get("slotId") ?? "");
  if (slotId) removeSlot(slotId);
  revalidatePath("/dashboard/schedule");
}

export async function setCapacityAction(formData: FormData): Promise<void> {
  const slotId = String(formData.get("slotId") ?? "");
  const capacity = Number(formData.get("capacity"));
  if (slotId && Number.isInteger(capacity) && capacity >= 1) {
    setSlotCapacity(slotId, capacity);
  }
  revalidatePath("/dashboard/schedule");
}

/** BKG-17: manual check-in / attendance marking (drives no-show + REV-1). */
export async function checkInAction(
  _prev: { message: string },
  formData: FormData,
): Promise<{ message: string }> {
  const reference = String(formData.get("reference") ?? "").trim().toUpperCase();
  const state = String(formData.get("state") ?? "attended") as BookingState;
  if (state !== "attended" && state !== "no_show") {
    return { message: "Only attended or no-show can be set here." };
  }
  const booking = bookingByReference(reference);
  if (!booking) return { message: `No booking found for ${reference || "(empty)"}.` };
  const result = transitionBooking(reference, state);
  revalidatePath("/dashboard/bookings");
  return result.ok
    ? { message: `${reference} marked ${state.replace("_", "-")}.` }
    : { message: result.error ?? "That transition isn't allowed." };
}
