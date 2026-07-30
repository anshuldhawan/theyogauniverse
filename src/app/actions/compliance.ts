"use server";

import { z } from "zod";
import { DATA_REQUEST_TYPES } from "@/lib/compliance";
import { submitDataRequest, submitDsaNotice } from "@/lib/compliance-workflows";
import { rateLimit } from "@/lib/ratelimit";
import { db, hasDatabase, schema } from "@/db";
import { headers } from "next/headers";

export interface ComplianceFormState {
  status: "idle" | "received" | "error";
  message?: string;
  reference?: string;
}

async function limited(scope: string): Promise<boolean> {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  return (await rateLimit(`${scope}:${ip}`, { limit: 5, windowSeconds: 3600 })).ok;
}

const dataRequestSchema = z.object({
  type: z.enum(DATA_REQUEST_TYPES),
  email: z.string().trim().email().max(200),
  detail: z.string().trim().min(5).max(4000),
});

export async function createDataSubjectRequest(
  _previous: ComplianceFormState,
  formData: FormData,
): Promise<ComplianceFormState> {
  const parsed = dataRequestSchema.safeParse({
    type: formData.get("type"),
    email: formData.get("email"),
    detail: formData.get("detail"),
  });
  if (!parsed.success) return { status: "error", message: "Please check every field." };
  if (!(await limited("data-request"))) {
    return { status: "error", message: "Too many requests. Please try again later." };
  }
  const request = submitDataRequest(parsed.data);
  if (hasDatabase()) {
    await db().insert(schema.dataSubjectRequests).values({
      id: request.id,
      requestType: request.type,
      requesterEmail: request.email,
      detail: request.detail,
      state: request.state,
      dueAt: request.dueAt,
    });
  }
  return {
    status: "received",
    reference: request.id,
    message: `Received. We will verify your identity and respond by ${request.dueAt.toLocaleDateString("en-US")}.`,
  };
}

const dsaSchema = z.object({
  targetUrl: z.string().trim().url().max(500),
  category: z.enum([
    "illegal_content",
    "unsafe_service",
    "impersonation",
    "intellectual_property",
    "other",
  ]),
  explanation: z.string().trim().min(20).max(5000),
  reporterEmail: z.string().trim().email().max(200),
  goodFaithConfirmed: z.literal("on"),
});

export async function createDsaNotice(
  _previous: ComplianceFormState,
  formData: FormData,
): Promise<ComplianceFormState> {
  const parsed = dsaSchema.safeParse({
    targetUrl: formData.get("targetUrl"),
    category: formData.get("category"),
    explanation: formData.get("explanation"),
    reporterEmail: formData.get("reporterEmail"),
    goodFaithConfirmed: formData.get("goodFaithConfirmed"),
  });
  if (!parsed.success) return { status: "error", message: "Please complete every field." };
  if (!(await limited("dsa-notice"))) {
    return { status: "error", message: "Too many notices. Please try again later." };
  }
  const notice = submitDsaNotice({ ...parsed.data, goodFaithConfirmed: true });
  if (hasDatabase()) {
    await db().insert(schema.dsaNotices).values({
      id: notice.id,
      targetUrl: notice.targetUrl,
      category: notice.category,
      explanation: notice.explanation,
      reporterEmail: notice.reporterEmail,
      status: notice.status,
    });
  }
  return {
    status: "received",
    reference: notice.id,
    message: "Notice received. We will assess it and provide a statement of reasons for our decision.",
  };
}
