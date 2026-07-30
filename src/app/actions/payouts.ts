"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  connectService,
  deriveConnectStatus,
  type PayoutInterval,
} from "@/lib/connect";
import { organisationById, providerBySlug, updateOrganisationConnect } from "@/lib/repo";

/*
 * PAY-3 — Connect onboarding & payout management actions. In production
 * these run behind Clerk with canManageOrganisation (ACC-12/ACC-13: payout
 * eligibility attaches to the Organisation); in guest/dev mode the dashboard
 * is a demo surface over the seed store, so the org-role check is a no-op.
 */

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function payoutsPath(providerSlug: string): string {
  return `/dashboard/payouts?as=${encodeURIComponent(providerSlug)}`;
}

/**
 * Start (or resume) Stripe-hosted Express onboarding for the provider's
 * Organisation. Creates the US Express account on first use (PAY-2/PAY-3),
 * then redirects the browser to the Stripe Account Link. The same action
 * serves "fix verification issues" for restricted accounts — Account Links
 * surface outstanding requirements on re-entry.
 */
export async function startConnectOnboardingAction(formData: FormData): Promise<void> {
  const providerSlug = String(formData.get("providerSlug") ?? "");
  const provider = providerBySlug(providerSlug);
  const organisation = provider ? organisationById(provider.organisationId) : undefined;
  if (!provider || !organisation) return;

  const service = connectService();
  let accountId = organisation.payoutEligibility.connectAccountId;

  if (!accountId) {
    const created = await service.createExpressAccount({
      organisationId: organisation.id,
      organisationName: organisation.name,
      email: provider.contactEmail,
    });
    if (!created.ok) {
      redirect(`${payoutsPath(providerSlug)}&error=account_create_failed`);
    }
    accountId = created.accountId;
    updateOrganisationConnect(organisation.id, {
      connectAccountId: accountId,
      connectStatus: "onboarding",
    });
  } else if (organisation.payoutEligibility.connectStatus === "none") {
    updateOrganisationConnect(organisation.id, { connectStatus: "onboarding" });
  }

  const returnUrl = `${siteUrl()}${payoutsPath(providerSlug)}&sync=1`;
  const refreshUrl = `${siteUrl()}${payoutsPath(providerSlug)}&refresh=1`;
  const link = await service.onboardingLink(accountId, returnUrl, refreshUrl);
  if (!link.ok) {
    redirect(`${payoutsPath(providerSlug)}&error=onboarding_link_failed`);
  }
  redirect(link.url);
}

/**
 * Re-fetch the Connect account from Stripe and sync our lifecycle status.
 * Used by the return-from-onboarding page load and the manual refresh button;
 * the webhook (PAY-4) keeps status fresh in between.
 */
export async function syncConnectStatusAction(formData: FormData): Promise<void> {
  const providerSlug = String(formData.get("providerSlug") ?? "");
  const provider = providerBySlug(providerSlug);
  const organisation = provider ? organisationById(provider.organisationId) : undefined;
  const accountId = organisation?.payoutEligibility.connectAccountId;
  if (!organisation || !accountId) return;

  const snapshot = await connectService().fetchAccount(accountId);
  if (snapshot) {
    updateOrganisationConnect(organisation.id, { connectStatus: deriveConnectStatus(snapshot) });
  }
  revalidatePath("/dashboard/payouts");
}

/** One-time login link to the Stripe Express dashboard (payout history, retries). */
export async function openExpressDashboardAction(formData: FormData): Promise<void> {
  const providerSlug = String(formData.get("providerSlug") ?? "");
  const provider = providerBySlug(providerSlug);
  const organisation = provider ? organisationById(provider.organisationId) : undefined;
  const accountId = organisation?.payoutEligibility.connectAccountId;
  if (!accountId) return;

  const link = await connectService().dashboardLoginLink(accountId);
  if (link.ok) redirect(link.url);
  redirect(`${payoutsPath(providerSlug)}&error=express_dashboard_unavailable`);
}

/** PAY-3: payout schedule — daily / weekly / monthly. */
export async function setPayoutScheduleAction(formData: FormData): Promise<void> {
  const providerSlug = String(formData.get("providerSlug") ?? "");
  const interval = String(formData.get("interval") ?? "");
  if (interval !== "daily" && interval !== "weekly" && interval !== "monthly") return;

  const provider = providerBySlug(providerSlug);
  const organisation = provider ? organisationById(provider.organisationId) : undefined;
  const accountId = organisation?.payoutEligibility.connectAccountId;
  if (!accountId) return;

  await connectService().setPayoutSchedule(accountId, interval as PayoutInterval);
  revalidatePath("/dashboard/payouts");
}
