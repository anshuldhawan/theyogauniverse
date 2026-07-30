"use server";

import { z } from "zod";
import { fileReport, REPORT_REASONS } from "@/lib/moderation";

export interface ReportActionState {
  message: string;
  ok: boolean;
}

const reportSchema = z.object({
  targetType: z.enum(["provider", "review", "message"]),
  targetId: z.string().min(1).max(200),
  reason: z.enum(REPORT_REASONS),
  detail: z.string().trim().min(10).max(2_000),
  website: z.string().max(0).optional(), // honeypot
});

export async function submitReportAction(
  _state: ReportActionState,
  formData: FormData,
): Promise<ReportActionState> {
  const parsed = reportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Choose a reason and add at least 10 characters." };
  if (parsed.data.website) return { ok: true, message: "Report received." };
  fileReport({
    targetType: parsed.data.targetType,
    targetId: parsed.data.targetId,
    reason: parsed.data.reason,
    detail: parsed.data.detail,
  });
  return {
    ok: true,
    message:
      parsed.data.reason === "safeguarding"
        ? "Report received and escalated to the safeguarding queue."
        : "Report received. Our Trust & Safety team will review it.",
  };
}
