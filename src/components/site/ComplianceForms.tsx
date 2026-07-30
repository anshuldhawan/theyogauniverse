"use client";

import { useActionState } from "react";
import {
  createDataSubjectRequest,
  createDsaNotice,
  type ComplianceFormState,
} from "@/app/actions/compliance";
import { Button, Field, Input, Select } from "@/components/ui";

const initial: ComplianceFormState = { status: "idle" };

function Result({ state }: { state: ComplianceFormState }) {
  if (state.status === "idle") return null;
  return (
    <p role="status" className={state.status === "error" ? "text-orange-600" : "text-leaf"}>
      {state.message} {state.reference && `Reference: ${state.reference}`}
    </p>
  );
}

export function DataRequestForm() {
  const [state, action, pending] = useActionState(createDataSubjectRequest, initial);
  return (
    <form action={action} className="mt-7 flex flex-col gap-4">
      <Field label="Request type">
        <Select name="type" required defaultValue="access">
          <option value="access">Access my data</option>
          <option value="rectification">Correct my data</option>
          <option value="erasure">Erase my data</option>
          <option value="portability">Export portable data</option>
          <option value="objection">Object to processing</option>
          <option value="sale_sharing_opt_out">Opt out of sale or sharing</option>
        </Select>
      </Field>
      <Field label="Email">
        <Input name="email" type="email" required autoComplete="email" />
      </Field>
      <Field label="What would you like us to do?">
        <textarea name="detail" required rows={5} className="w-full rounded-[10px] border border-mint-200 p-3" />
      </Field>
      <Result state={state} />
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Submitting…" : "Submit privacy request"}
      </Button>
    </form>
  );
}

export function DsaNoticeForm() {
  const [state, action, pending] = useActionState(createDsaNotice, initial);
  return (
    <form action={action} className="mt-7 flex flex-col gap-4">
      <Field label="URL of the content or listing">
        <Input name="targetUrl" type="url" required />
      </Field>
      <Field label="Reason">
        <Select name="category" required defaultValue="illegal_content">
          <option value="illegal_content">Illegal content or service</option>
          <option value="unsafe_service">Unsafe service</option>
          <option value="impersonation">Impersonation</option>
          <option value="intellectual_property">Intellectual property</option>
          <option value="other">Other</option>
        </Select>
      </Field>
      <Field label="Explain why, including the relevant law if known">
        <textarea name="explanation" required rows={6} className="w-full rounded-[10px] border border-mint-200 p-3" />
      </Field>
      <Field label="Email for our decision">
        <Input name="reporterEmail" type="email" required />
      </Field>
      <label className="flex gap-2 text-sm text-body">
        <input name="goodFaithConfirmed" type="checkbox" required />
        I believe in good faith that the information in this notice is accurate.
      </label>
      <Result state={state} />
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Submitting…" : "Submit notice"}
      </Button>
    </form>
  );
}
