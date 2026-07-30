"use client";

import { useActionState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { sendContactMessage, type ContactFormState } from "@/app/actions/contact";

const initialState: ContactFormState = { status: "idle" };

/**
 * BKG-20 contact form. The confirmation copy is deliberate: the user is
 * contacting the provider; the platform is not party to what follows, no
 * response time is promised, and nothing has been reserved (WVR-8, COMP-7).
 */
export function ContactForm({
  providerSlug,
  providerName,
}: {
  providerSlug: string;
  providerName: string;
}) {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);

  if (state.status === "sent") {
    return (
      <div className="rounded-[18px] border border-sage bg-mint p-6.5">
        <p className="heading-card text-[22px]">
          Your message was forwarded to {providerName}.
        </p>
        <p className="mt-3 text-[15px] leading-[1.7] text-body">
          Any reply will come directly from them to your email address. The Yoga Universe is not part
          of this conversation: nothing has been booked or reserved, no response time is
          guaranteed, and anything you arrange — including payment — is between you and{" "}
          {providerName}. Their terms, not ours, apply to it.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="providerSlug" value={providerSlug} />
      <div className="grid-fit-240 gap-4">
        <Field label="Your name">
          <Input name="name" required autoComplete="name" />
        </Field>
        <Field label="Your email">
          <Input name="email" type="email" required autoComplete="email" />
        </Field>
      </div>
      <Field label="Your message">
        <textarea
          name="message"
          required
          minLength={10}
          rows={5}
          placeholder="Include dates or numbers as free text if relevant. Nothing is reserved until the provider confirms with you directly."
          className="w-full rounded-[10px] border border-mint-200 bg-white px-3.5 py-3 text-[15px] leading-relaxed text-forest outline-none focus:border-sage"
        />
      </Field>
      {state.status === "error" && (
        <p className="text-[14px] text-orange-600">{state.error}</p>
      )}
      <Button type="submit" tone="forest" disabled={pending} className="self-start">
        {pending ? "Sending…" : "Send message"}
      </Button>
      <p className="text-[12.5px] leading-relaxed text-faint">
        Your message goes straight to {providerName}. You are contacting them directly —
        The Yoga Universe takes no fee and is not party to what follows.
      </p>
    </form>
  );
}
