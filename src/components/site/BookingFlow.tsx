"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button, Field, Input, Select } from "@/components/ui";
import {
  abandonPaymentSession,
  createBooking,
  createPaymentSession,
  finalizeBooking,
  type BookingFormState,
} from "@/app/actions/booking";
import { ageInYears, isAccountAgeEligible } from "@/lib/compliance";

export interface BookableSlot {
  id: string;
  day: string;
  time: string;
  what: string;
  where: string;
  placesLeft: number;
  priceLabel: string;
}

interface Props {
  providerSlug: string;
  providerName: string;
  backHref: string;
  slots: BookableSlot[];
  initialSlotId?: string;
  waiverText: string;
  travelInsuranceUrl?: string | null;
}

const STEPS = ["Choose a class", "Your details", "Waiver", "Payment"] as const;

const initialState: BookingFormState = { status: "idle" };

/**
 * PAY-15 (SAQ-A): payment is collected in Stripe-hosted fields (Payment
 * Element); card data never reaches our server. Without a publishable key
 * the flow falls back to the demo/mock rail.
 */
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

/** PaymentElement styling, matched to the brand palette. */
const STRIPE_APPEARANCE = {
  variables: {
    colorPrimary: "#157a3d",
    colorText: "#1b391c",
    colorDanger: "#e5502d",
    borderRadius: "10px",
    fontFamily: "Roboto, system-ui, sans-serif",
  },
} as const;

interface PaymentSession {
  clientSecret: string;
  reference: string;
  /** Snapshot of the inputs the session was created from (stale-session guard). */
  snapshot: string;
}

/** The prototype's booking flow, with the app's waiver and Stripe steps. */
export function BookingFlow({
  providerSlug,
  providerName,
  backHref,
  slots,
  initialSlotId,
  waiverText,
  travelInsuranceUrl,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(initialSlotId ? 1 : 0);
  const [slotId, setSlotId] = useState<string | null>(initialSlotId ?? null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [billingCountry, setBillingCountry] = useState("US");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [guardianConfirmed, setGuardianConfirmed] = useState(false);
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [state, formAction, pending] = useActionState(createBooking, initialState);
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  const [session, setSession] = useState<PaymentSession | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  const slot = slots.find((s) => s.id === slotId) ?? null;
  const age = ageInYears(dateOfBirth);
  const ageEligible = isAccountAgeEligible({ dateOfBirth, country: billingCountry });
  const guardianRequired = age !== null && age < 18;
  const detailsValid =
    name.trim().length >= 2 &&
    /.+@.+\..+/.test(email) &&
    ageEligible &&
    (!guardianRequired || guardianConfirmed);

  function sessionFormData(idemKey: string): FormData {
    const fd = new FormData();
    fd.set("providerSlug", providerSlug);
    fd.set("slotId", slotId ?? "");
    fd.set("name", name);
    fd.set("email", email);
    fd.set("billingCountry", billingCountry);
    fd.set("dateOfBirth", dateOfBirth);
    if (guardianConfirmed) fd.set("guardianConfirmed", "on");
    fd.set("waiverAccepted", "on");
    fd.set("idempotencyKey", idemKey);
    return fd;
  }

  /** Stripe rail: reserve the seat + create the PaymentIntent on entering payment. */
  async function enterPaymentStep() {
    if (!stripePromise) {
      setStep(3);
      return;
    }
    const snapshot = JSON.stringify({
      slotId,
      name,
      email,
      billingCountry,
      dateOfBirth,
      guardianConfirmed,
    });
    if (session && session.snapshot === snapshot) {
      setStep(3);
      return;
    }
    setSessionLoading(true);
    setSessionError(null);
    try {
      // Replacing a stale session (buyer changed class/details): release its seat.
      if (session) {
        await abandonPaymentSession(session.reference);
        setSession(null);
      }
      // A fresh key per session; replays of the same session reuse the intent (NFR-11).
      const idemKey = session ? crypto.randomUUID() : idempotencyKey;
      const result = await createPaymentSession(sessionFormData(idemKey));
      if (!result.ok) {
        setSessionError(result.error);
        return;
      }
      if (!result.clientSecret) {
        // Free class: nothing to pay, booking already confirmed.
        router.push(`/booking/${result.reference}`);
        return;
      }
      setSession({
        clientSecret: result.clientSecret,
        reference: result.reference,
        snapshot,
      });
      setStep(3);
    } finally {
      setSessionLoading(false);
    }
  }

  return (
    <div>
      <p className="eyebrow mb-3">
        Step {step + 1} of {STEPS.length} · {STEPS[step]}
      </p>
      <h1
        className={`mb-2 ${step === 0 ? "display-2" : "display-2 text-[clamp(26px,3.6vw,40px)]"}`}
      >
        {step === 0
          ? providerName
          : step === 1
            ? (slot?.what ?? "Your details")
            : step === 2
              ? "One waiver to sign"
              : `Paying ${slot?.priceLabel ?? ""}`}
      </h1>
      <p className="mb-8 text-[16px] leading-[1.7] text-muted">
        {step === 0
          ? "Live availability. Places are held for ten minutes while you pay."
          : step === 1
            ? "That is all we ask. Injuries and questions go straight to the teacher after booking."
            : step === 2
              ? `You sign this once per teacher — it covers this and future bookings with ${providerName}.`
              : `${slot?.what ?? ""} · ${slot?.day ?? ""} ${slot?.time ?? ""} · ${providerName}`}
      </p>

      {slot && step > 0 && (
        <div className="mb-6.5 flex flex-wrap gap-x-6 gap-y-2 rounded-[14px] bg-mint p-5">
          <span className="text-[14.5px] text-forest">{providerName}</span>
          <span className="text-[14.5px] text-body">
            {slot.day} · {slot.time}
          </span>
          <span className="text-[14.5px] text-body">{slot.where}</span>
          <span className="ml-auto text-[14.5px] text-leaf">{slot.priceLabel}</span>
        </div>
      )}

      <form action={formAction}>
        <input type="hidden" name="providerSlug" value={providerSlug} />
        <input type="hidden" name="slotId" value={slotId ?? ""} />
        <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
        {/* Keep validated values in the form regardless of visible step */}
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="billingCountry" value={billingCountry} />
        <input type="hidden" name="dateOfBirth" value={dateOfBirth} />
        {guardianConfirmed && <input type="hidden" name="guardianConfirmed" value="on" />}
        {waiverAccepted && <input type="hidden" name="waiverAccepted" value="on" />}

        {step === 0 && (
          <div className="flex flex-col gap-2.5">
            {slots.map((s) => {
              const full = s.placesLeft <= 0;
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={full}
                  onClick={() => {
                    setSlotId(s.id);
                    setStep(1);
                  }}
                  className={`flex w-full flex-wrap items-center gap-x-4.5 gap-y-3 rounded-[14px] border p-4.5 text-left transition-colors ${
                    full
                      ? "cursor-not-allowed border-mint-200 bg-mint-wash"
                      : slotId === s.id
                        ? "cursor-pointer border-forest bg-mint"
                        : "cursor-pointer border-mint-200 hover:border-sage"
                  }`}
                >
                  <span className="min-w-0 flex-[1_1_200px]">
                    <span className="block text-[15.5px] font-medium text-forest">
                      {s.what}
                    </span>
                    <span className="mt-1.25 block text-[13px] text-muted">
                      {s.day} · {s.time} · {s.where}
                    </span>
                  </span>
                  <span
                    className={`flex-none text-[13px] ${
                      full ? "text-faint" : s.placesLeft <= 3 ? "text-orange" : "text-leaf"
                    }`}
                  >
                    {full ? "Full" : `${s.placesLeft} left`}
                  </span>
                  <span className="flex-none text-[15px] font-medium text-forest">
                    {s.priceLabel}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {step === 1 && (
          <div className="flex max-w-md flex-col gap-4">
            <Field label="Full name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </Field>
            <Field label="Email">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
              />
            </Field>
            <Field label="Billing country">
              <Select
                value={billingCountry}
                onChange={(e) => setBillingCountry(e.target.value)}
              >
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="AU">Australia</option>
                <option value="CA">Canada</option>
              </Select>
            </Field>
            <Field label="Date of birth">
              <Input
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                type="date"
                required
                autoComplete="bday"
              />
            </Field>
            {dateOfBirth && !ageEligible && (
              <p className="text-sm text-orange-600">
                You do not meet the minimum age for this jurisdiction.
              </p>
            )}
            {guardianRequired && ageEligible && (
              <label className="flex gap-2 text-sm text-body">
                <input
                  type="checkbox"
                  checked={guardianConfirmed}
                  onChange={(e) => setGuardianConfirmed(e.target.checked)}
                />
                My parent or legal guardian consents to this booking.
              </label>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4.5">
            <div className="max-h-72 overflow-y-auto rounded-[14px] border border-mint-200 bg-mint-wash p-5.5 text-[14.5px] leading-[1.75] whitespace-pre-line text-body">
              {waiverText}
            </div>
            <label className="flex cursor-pointer items-start gap-2.5 text-[15px] text-body">
              <input
                type="checkbox"
                checked={waiverAccepted}
                onChange={(e) => setWaiverAccepted(e.target.checked)}
                className="mt-1 accent-[#157a3d]"
              />
              <span>
                I have read and agree to the waiver, signing as{" "}
                <span className="font-medium text-forest">{name || "…"}</span>
              </span>
            </label>
            {sessionError && <p className="text-[14px] text-orange-600">{sessionError}</p>}
          </div>
        )}

        {step === 3 && (
          <div className="flex max-w-md flex-col gap-4.5">
            {stripePromise && session ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: session.clientSecret,
                  appearance: STRIPE_APPEARANCE,
                }}
              >
                <StripePaymentStep
                  reference={session.reference}
                  priceLabel={slot?.priceLabel ?? ""}
                />
              </Elements>
            ) : (
              <>
                <p className="rounded-[10px] bg-mint p-4 text-[13px] leading-relaxed text-body">
                  Demo checkout — no real payment is taken. In production this step is
                  Stripe&apos;s payment element (cards, Apple Pay, Google Pay, Link).
                </p>
                {state.status === "error" && (
                  <p className="text-[14px] text-orange-600">{state.error}</p>
                )}
                <Button
                  type="submit"
                  disabled={pending || !slot || !detailsValid || !waiverAccepted}
                  className="w-full"
                >
                  {pending ? "Confirming…" : `Confirm and pay ${slot?.priceLabel ?? ""}`}
                </Button>
              </>
            )}

            <p className="text-[12.5px] leading-relaxed text-faint">
              Cancellation: free until 12 hours before the class; after that the session is
              charged in full. This policy is saved with your booking.
            </p>
            {travelInsuranceUrl && (
              <p className="rounded-[10px] border border-mint-200 p-4 text-[12.5px] leading-relaxed text-body">
                Retreat travel insurance is optional and sold by an independent partner.{" "}
                <a
                  href={travelInsuranceUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="underline"
                >
                  Review cover and exclusions
                </a>
                . We do not share your name, email, or payment details.
              </p>
            )}
          </div>
        )}

        {/* Step navigation */}
        <div className="mt-9 flex flex-wrap items-center gap-5">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="link-back cursor-pointer"
            >
              ← Back
            </button>
          )}
          {step > 0 && step < 3 && (
            <Button
              type="button"
              tone="forest"
              disabled={
                (step === 1 && !detailsValid) ||
                (step === 2 && !waiverAccepted) ||
                sessionLoading
              }
              onClick={() => {
                if (step === 2) void enterPaymentStep();
                else setStep(step + 1);
              }}
            >
              {step === 2 && sessionLoading ? "Preparing secure payment…" : "Continue"}
            </Button>
          )}
          <Link href={backHref} className="link-back ml-auto text-faint hover:text-orange">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

/** Stripe-hosted fields + confirm; must render inside <Elements>. */
function StripePaymentStep({
  reference,
  priceLabel,
}: {
  reference: string;
  priceLabel: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    if (!stripe || !elements) return;
    setPaying(true);
    setError(null);
    try {
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Redirect-based methods return to the confirmation page, which
          // finalizes server-side; card payments resolve in place below.
          return_url: `${window.location.origin}/booking/${reference}`,
        },
        redirect: "if_required",
      });
      if (confirmError) {
        setError(confirmError.message ?? "Payment failed. Please try again.");
        return;
      }
      const result = await finalizeBooking(reference);
      if (result.ok) {
        router.push(`/booking/${result.reference}`);
        return;
      }
      setError(result.error);
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="flex flex-col gap-4.5">
      <PaymentElement />
      {error && <p className="text-[14px] text-orange-600">{error}</p>}
      <Button
        type="button"
        onClick={() => void pay()}
        disabled={paying || !stripe || !elements}
        className="w-full"
      >
        {paying ? "Processing…" : `Pay ${priceLabel}`}
      </Button>
      <p className="text-center text-[11.5px] text-faint">
        Payments are processed by Stripe. Card details never touch our servers.
      </p>
    </div>
  );
}
