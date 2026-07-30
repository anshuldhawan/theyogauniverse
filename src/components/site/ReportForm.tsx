"use client";

import { useActionState, useState } from "react";
import { submitReportAction, type ReportActionState } from "@/app/actions/report";
import { Button, Input, Select } from "@/components/ui";

const initialState: ReportActionState = { ok: false, message: "" };

export function ReportForm({
  targetType,
  targetId,
}: {
  targetType: "provider" | "review" | "message";
  targetId: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(submitReportAction, initialState);

  if (!open && !state.ok) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs text-faint underline">
        Report this {targetType}
      </button>
    );
  }

  return (
    <form action={action} className="mt-3 space-y-3 rounded-xl border border-mint-200 bg-white p-4">
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetId" value={targetId} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      {!state.ok && (
        <>
          <Select name="reason" required aria-label="Report reason">
            <option value="">Choose a reason</option>
            <option value="safeguarding">Safeguarding concern</option>
            <option value="professional_misconduct">Professional misconduct</option>
            <option value="impersonation">Impersonation</option>
            <option value="misleading_credentials">Misleading credentials</option>
            <option value="inappropriate_content">Inappropriate content</option>
            <option value="phishing">Scam or phishing</option>
            <option value="wrong_information">Incorrect or closed</option>
            <option value="other">Other</option>
          </Select>
          <Input
            name="detail"
            required
            minLength={10}
            maxLength={2_000}
            placeholder="Describe what happened. Do not include highly sensitive documents."
          />
          <div className="flex items-center gap-3">
            <Button type="submit" tone="outline" disabled={pending} className="px-4 py-2 text-[11px]">
              {pending ? "Sending…" : "Send report"}
            </Button>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-faint">
              Cancel
            </button>
          </div>
        </>
      )}
      {state.message && (
        <p role="status" className={`text-xs ${state.ok ? "text-leaf" : "text-orange"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
