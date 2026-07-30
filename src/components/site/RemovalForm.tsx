"use client";

import { useActionState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { submitRemovalRequest, type RemovalFormState } from "@/app/actions/removal";

const initialState: RemovalFormState = { status: "idle" };

/**
 * ING-7 removal-request form. The copy states the guarantee plainly: anyone
 * can ask, verified requests are instant, everything else is actioned within
 * 72 hours, and removal is permanent.
 */
export function RemovalForm() {
  const [state, formAction, pending] = useActionState(submitRemovalRequest, initialState);

  if (state.status === "received" || state.status === "removed") {
    return (
      <div className="rounded-[18px] border border-sage bg-mint p-6.5">
        <p className="heading-card text-[22px]">
          {state.status === "removed" ? "Listing removed." : "Request received."}
        </p>
        <p className="mt-3 text-[15px] leading-[1.7] text-body">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Link to the listing, or the name on it">
        <Input
          name="listing"
          required
          placeholder="https://www.theyogauniverse.com/your-name"
        />
      </Field>
      <div className="grid-fit-240 gap-4">
        <Field label="Your name">
          <Input name="name" required autoComplete="name" />
        </Field>
        <Field label="Your email">
          <Input name="email" type="email" required autoComplete="email" />
        </Field>
      </div>
      <Field label="Anything we should know? (optional)">
        <textarea
          name="detail"
          rows={4}
          className="w-full rounded-[10px] border border-mint-200 bg-white px-3.5 py-3 text-[15px] leading-relaxed text-forest outline-none focus:border-sage"
        />
      </Field>
      {state.status === "error" && <p className="text-[14px] text-orange-600">{state.message}</p>}
      <Button type="submit" tone="forest" disabled={pending} className="self-start">
        {pending ? "Submitting…" : "Request removal"}
      </Button>
      <p className="text-[12.5px] leading-relaxed text-faint">
        If the email you give matches the contact address on the listing, removal is immediate.
        Otherwise we review and action it within 72 hours. Removal is permanent — the listing
        cannot be re-created by our data sources.
      </p>
    </form>
  );
}
