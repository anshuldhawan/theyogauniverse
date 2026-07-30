/**
 * BLG-21 CI enforcement: every article in `published` state must pass the
 * publish gate. This suite failing IS the gate — there is no manual override.
 * Run standalone via `pnpm editorial:gate`.
 */
import { describe, expect, it } from "vitest";
import { AUTHORS } from "@/data/editorial/authors";
import { CLUSTERS } from "@/data/editorial/clusters";
import { runGateOverCorpus } from "./gate";
import { allArticles, clusters, pillarOf } from "./store";

describe("editorial publish gate — launch corpus", () => {
  const { results, anchorWarnings } = runGateOverCorpus({
    articles: allArticles(),
    clusters: CLUSTERS,
    authors: AUTHORS,
  });

  it("every published article passes all blocking checks", () => {
    const failing = results.filter((r) => r.errors.length > 0);
    const report = failing
      .map((r) => `\n${r.slug}:\n  - ${r.errors.join("\n  - ")}`)
      .join("");
    expect(failing, `Publish gate violations:${report}`).toEqual([]);
  });

  it("every cluster has a published pillar (BLG-8)", () => {
    for (const cluster of clusters()) {
      expect(pillarOf(cluster.id), `cluster ${cluster.id} has no published pillar`).toBeDefined();
    }
  });

  it("surfaces (non-blocking) anchor and content warnings for review", () => {
    const warnings = results.flatMap((r) => r.warnings.map((w) => `${r.slug}: ${w}`));
    for (const warning of [...warnings, ...anchorWarnings.map((w) => `${w.href}: "${w.anchor}"`)]) {
      console.warn(`[gate warning] ${warning}`);
    }
    expect(anchorWarnings.length).toBeLessThan(20);
  });
});
