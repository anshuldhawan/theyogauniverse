"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { rateLimit } from "@/lib/ratelimit";
import { requestRemoval } from "@/lib/removal";

/**
 * ING-7 / Decision #7 — public listing-removal requests. No account needed.
 * Verified requests (email matches the listing contact) are honoured
 * immediately; the rest queue in /admin/moderation with a 72-hour SLA.
 */

const removalSchema = z.object({
  listing: z.string().trim().min(2).max(300),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  detail: z.string().trim().max(2000).optional(),
});

export interface RemovalFormState {
  status: "idle" | "received" | "removed" | "error";
  message?: string;
}

export async function submitRemovalRequest(
  _prev: RemovalFormState,
  formData: FormData,
): Promise<RemovalFormState> {
  const parsed = removalSchema.safeParse({
    listing: formData.get("listing"),
    name: formData.get("name"),
    email: formData.get("email"),
    detail: formData.get("detail") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: "Please check the listing, your name and your email." };
  }

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limit = await rateLimit(`removal:${ip}`, { limit: 5, windowSeconds: 3600 });
  if (!limit.ok) {
    return {
      status: "error",
      message: "Too many requests in the last hour. Please try again later.",
    };
  }

  const outcome = requestRemoval(parsed.data);
  if (outcome.kind === "removed") {
    revalidatePath("/", "layout");
    return {
      status: "removed",
      message: `${outcome.providerName} has been removed from the index. The removal is permanent — the listing will not reappear.`,
    };
  }
  return {
    status: "received",
    message: outcome.providerName
      ? `Your request about ${outcome.providerName} is in our review queue. We action removal requests within 72 hours.`
      : "Your request is in our review queue. We action removal requests within 72 hours.",
  };
}
