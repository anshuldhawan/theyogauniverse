"use server";

import { revalidatePath } from "next/cache";
import {
  defaultNotificationPreferences,
  MARKETING_TOPICS,
  saveNotificationPreferences,
} from "@/lib/messaging";

export async function saveNotificationPreferencesAction(formData: FormData): Promise<void> {
  const subjectId = String(formData.get("subjectId") ?? "");
  if (!subjectId) return;
  const preferences = defaultNotificationPreferences();
  preferences.transactional.web_push = formData.get("transactional:web_push") === "on";
  const sms = formData.get("transactional:sms") === "on";
  preferences.transactional.sms = sms;
  preferences.smsOptInAt = sms ? new Date() : null;
  for (const topic of MARKETING_TOPICS) {
    preferences.marketing.email[topic] = formData.get(`marketing:email:${topic}`) === "on";
    preferences.marketing.web_push[topic] =
      formData.get(`marketing:web_push:${topic}`) === "on";
    preferences.marketing.sms[topic] = formData.get(`marketing:sms:${topic}`) === "on";
  }
  saveNotificationPreferences(subjectId, preferences);
  revalidatePath("/dashboard/notifications");
}
