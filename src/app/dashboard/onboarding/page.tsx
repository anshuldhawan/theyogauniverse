import type { Metadata } from "next";
import Link from "next/link";
import { Card, SectionLabel } from "@/components/ui";
import {
  nextOnboardingStep,
  providerIsTransactable,
  resolveDashboardProvider,
  type OnboardingStep,
} from "@/lib/dashboard";

export const metadata: Metadata = { title: "Onboarding" };

const LABELS: Record<OnboardingStep, string> = {
  profile: "Claim or create profile",
  identity: "Verify identity",
  commercial_mode: "Choose payments or advertising-only",
  schedule: "Import or add schedule",
  publish: "Review and publish",
};

export default function OnboardingPage() {
  const provider = resolveDashboardProvider();
  const transactable = providerIsTransactable(provider);
  const state = {
    providerId: provider.id,
    domicileCountry: provider.country ?? "US",
    completed: ["profile", "identity", "commercial_mode", "schedule"] as OnboardingStep[],
    identityVerified: provider.verificationTier !== "self_declared",
    commercialMode: transactable ? ("stripe" as const) : ("advertising_only" as const),
    updatedAt: new Date(),
  };
  const next = nextOnboardingStep(state);

  return (
    <div>
      <SectionLabel>DASH-1</SectionLabel>
      <h1 className="mt-2 text-3xl">Publish your profile</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sage-600">
        Progress is saved after every step. Advertising-only is a complete path: your profile,
        contact details, schedule and performance reporting work without marketplace payments.
      </p>
      <ol className="mt-8 grid gap-3">
        {(Object.keys(LABELS) as OnboardingStep[]).map((step, index) => {
          const complete = state.completed.includes(step);
          return (
            <Card key={step} className="flex items-center gap-4 p-5">
              <span className={`flex size-8 items-center justify-center rounded-full text-sm ${
                complete ? "bg-leaf text-white" : "bg-mint text-forest"
              }`}>
                {complete ? "✓" : index + 1}
              </span>
              <div className="flex-1">
                <h2 className="font-medium text-forest">{LABELS[step]}</h2>
                {step === "commercial_mode" && (
                  <p className="mt-1 text-xs text-sage-600">
                    Selected: {transactable ? "Stripe marketplace payments" : "advertising-only"}
                  </p>
                )}
              </div>
              {step === next && (
                <Link href={step === "schedule" ? "/dashboard/schedule" : "/dashboard"} className="text-sm underline">
                  Continue
                </Link>
              )}
            </Card>
          );
        })}
      </ol>
    </div>
  );
}
