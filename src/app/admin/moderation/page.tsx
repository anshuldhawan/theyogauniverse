import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { Button, Card, EmptyState, SectionLabel } from "@/components/ui";
import { escalationLevel, openReports, resolveReport, triageReport } from "@/lib/moderation";
import { honorRemoval, removalSlaState } from "@/lib/removal";

export const metadata: Metadata = { title: "Moderation" };
export const dynamic = "force-dynamic";

async function resolveAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (status === "actioned" || status === "dismissed") {
    resolveReport(id, status, "ops@theyogauniverse (demo)", String(formData.get("outcome") ?? status));
  }
  revalidatePath("/admin/moderation");
}

/** ING-7: one-click honour for removal requests — suppress + tombstone + audit. */
async function honorRemovalAction(formData: FormData): Promise<void> {
  "use server";
  const id = String(formData.get("id") ?? "");
  honorRemoval(id, "ops@theyogauniverse (demo)");
  revalidatePath("/admin/moderation");
  revalidatePath("/", "layout");
}

export default function ModerationQueue() {
  const reports = openReports();

  return (
    <div>
      <SectionLabel tone="orange">TSF</SectionLabel>
      <h1 className="mt-2 text-3xl">Moderation queue</h1>
      <p className="mt-1 text-sm text-sage-600">
        Reports from all surfaces land here. Every resolution is logged with the acting admin —
        nothing is removed silently (REV-7). Removal requests carry a 72-hour SLA (ING-7).
      </p>

      <div className="mt-8 space-y-2">
        {reports.length === 0 && (
          <EmptyState title="Queue is clear">
            Reports filed from provider pages, reviews and listing-removal requests appear here.
          </EmptyState>
        )}
        {reports.map((report) => {
          const sla = removalSlaState(report);
          const triage = triageReport(report);
          return (
            <Card key={report.id} className="flex flex-wrap items-center gap-4 p-4 text-sm">
              <span className="rounded-full bg-mint px-3 py-1 text-xs font-medium text-forest">
                {report.reason.replace(/_/g, " ")}
              </span>
              <span className="text-xs font-medium text-orange">
                {triage.severity} · {triage.slaHours}h SLA
                {triage.requiresLegalReview ? " · legal review" : ""}
              </span>
              <span className="text-sage-600">
                {report.targetType} · {report.targetId}
              </span>
              <span className="min-w-40 flex-1">{report.detail}</span>
              <span className="text-xs text-faint">
                opened {report.createdAt.toISOString().slice(0, 10)}
              </span>
              {sla === "overdue" && (
                <span className="rounded-full bg-orange/15 px-3 py-1 text-xs font-medium text-orange">
                  removal overdue
                </span>
              )}
              {escalationLevel(report.targetId) !== "none" && (
                <span className="rounded-full bg-orange/15 px-3 py-1 text-xs font-medium text-orange">
                  {escalationLevel(report.targetId)}
                </span>
              )}
              {report.reason === "removal_request" ? (
                <form action={honorRemovalAction}>
                  <input type="hidden" name="id" value={report.id} />
                  <Button type="submit" tone="forest">
                    Honor removal
                  </Button>
                </form>
              ) : (
                <form action={resolveAction} className="flex gap-2">
                  <input type="hidden" name="id" value={report.id} />
                  <input type="hidden" name="outcome" value="Reviewed by ops" />
                  <Button type="submit" name="status" value="actioned" tone="forest">
                    Action
                  </Button>
                  <Button type="submit" name="status" value="dismissed" tone="ghost">
                    Dismiss
                  </Button>
                </form>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
