import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const TRACKER_DIR = path.join(ROOT, "tracker");
export const BASELINE_FILE = path.join(TRACKER_DIR, "BASELINE.md");

/** Requirement families, in document order, with display names. */
export const SECTIONS = {
  DM: "Domain Model rules (§6.1)",
  NG: "Non-Goals (§3)",
  ACC: "Identity & Accounts (§7.1)",
  PRO: "Provider Profiles (§7.2)",
  CRD: "Credential Verification (§7.3)",
  LST: "Listing Types & Inventory (§7.4)",
  SCH: "Scheduling Engine (§7.5)",
  SRCH: "Search & Discovery (§7.6)",
  BKG: "Booking & Checkout (§7.7)",
  PAY: "Payments, Payouts & Tax (§7.8)",
  WVR: "Waivers, Health Intake & Liability (§7.9)",
  REV: "Reviews & Ratings (§7.10)",
  MSG: "Messaging & Notifications (§7.11)",
  DASH: "Provider Dashboard (§7.12)",
  ING: "Data Ingestion, Seeding & Claim (§7.13)",
  SEO: "SEO & AEO Architecture (§7.14)",
  TSF: "Trust, Safety & Moderation (§7.15)",
  ADM: "Admin & Ops Console (§7.16)",
  ANL: "Analytics & Reporting (§7.17)",
  INT: "Integrations (§7.18)",
  WEB: "Responsive Web (§7.19)",
  NFR: "Non-Functional Requirements (§8)",
  COMP: "Compliance & Legal (§9)",
  LOC: "Localisation (§10)",
  BLG: "Editorial & Blog Module (module v1.0)",
};

export const VALID_STATUSES = ["todo", "in-progress", "done", "blocked", "deferred", "n-a"];

/**
 * Read every pinned baseline from BASELINE.md. Each block starts with a
 * **File:** line and carries **Version:** and **SHA-256:**; module baselines
 * additionally declare **Prefix:** (the requirement families they own,
 * comma-separated). The baseline with no Prefix owns every family not
 * claimed by a module.
 */
export function readBaselines() {
  const text = readFileSync(BASELINE_FILE, "utf8");
  const blocks = [];
  const blockPattern =
    /\*\*File:\*\*\s*`([^`]+)`\s*\n-?\s*\*\*Version:\*\*\s*([^\n]+)\n(?:-?\s*\*\*Prefix:\*\*\s*([^\n]+)\n)?[\s\S]*?\*\*SHA-256:\*\*\s*`([0-9a-f]{64})`/g;
  for (const match of text.matchAll(blockPattern)) {
    blocks.push({
      file: match[1],
      version: match[2].trim(),
      prefixes: match[3] ? match[3].split(",").map((s) => s.trim()) : null,
      checksum: match[4],
    });
  }
  if (blocks.length === 0) {
    throw new Error("tracker/BASELINE.md is malformed: need **File:**, **Version:**, **SHA-256:**");
  }
  const claimed = new Set(blocks.flatMap((b) => b.prefixes ?? []));
  for (const block of blocks) {
    block.families = block.prefixes ?? Object.keys(SECTIONS).filter((f) => !claimed.has(f));
  }
  return blocks;
}

/** Family -> owning baseline, across all pinned baselines. */
export function baselineByFamily() {
  const map = new Map();
  for (const baseline of readBaselines()) {
    for (const family of baseline.families) map.set(family, baseline);
  }
  return map;
}

export function checksumOf(relPath) {
  const abs = path.join(ROOT, relPath);
  return createHash("sha256").update(readFileSync(abs)).digest("hex");
}

/**
 * Parse requirement definitions out of the baseline document.
 * A definition is a top-level bullet of the form:
 *   - **ACC-1.** ...            (active)
 *   - ~~**PRO-8.** ...~~ ...    (removed/struck)
 * Nested sub-requirements like PAY-11a and PAY-17a are also defined as
 * bullets ("- **PAY-11a. ...**" / "- **PAY-17a. NEW ...**") at any indent.
 */
export function parseRequirements(relPath, allowedFamilies = null) {
  const text = readFileSync(path.join(ROOT, relPath), "utf8");
  const pattern = /^\s*-\s+(~~)?\*\*([A-Z]+-\d+[a-z]?)[.\s]/gm;
  const seen = new Map();
  for (const match of text.matchAll(pattern)) {
    const removed = Boolean(match[1]);
    const id = match[2];
    const family = id.split("-")[0];
    if (!SECTIONS[family]) continue;
    if (allowedFamilies && !allowedFamilies.includes(family)) continue;
    if (!seen.has(id)) seen.set(id, { id, family, removed });
  }
  return [...seen.values()];
}

/** Parse rows of a tracker section file: | ID | status | phase | notes |. */
export function parseSectionRows(text) {
  const rows = [];
  for (const line of text.split("\n")) {
    const match = /^\|\s*([A-Z]+-\d+[a-z]?)\s*\|\s*([a-z-]+)\s*\|\s*([^|]*)\|(.*)\|\s*$/.exec(line);
    if (match) {
      rows.push({
        id: match[1],
        status: match[2].trim(),
        phase: match[3].trim(),
        notes: match[4].trim(),
      });
    }
  }
  return rows;
}

/** Natural ordering for requirement IDs (ACC-2 < ACC-10, PAY-11 < PAY-11a). */
export function compareIds(a, b) {
  const parse = (id) => {
    const m = /^([A-Z]+)-(\d+)([a-z]?)$/.exec(id);
    return [m[1], Number(m[2]), m[3]];
  };
  const [fa, na, sa] = parse(a);
  const [fb, nb, sb] = parse(b);
  if (fa !== fb) return fa < fb ? -1 : 1;
  if (na !== nb) return na - nb;
  return sa < sb ? -1 : sa > sb ? 1 : 0;
}
