/**
 * Tracker integrity check, run in CI.
 * Fails if:
 *  1. the baseline requirements file was edited without bumping BASELINE.md
 *     (checksum drift);
 *  2. a requirement ID in the baseline document has no tracker row;
 *  3. a tracker row references an ID that does not exist in the baseline;
 *  4. a row carries an invalid status, or is `done` without a note.
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import {
  SECTIONS,
  TRACKER_DIR,
  VALID_STATUSES,
  readBaselines,
  checksumOf,
  parseRequirements,
  parseSectionRows,
} from "./lib.mjs";

const errors = [];
const baselines = readBaselines();

for (const baseline of baselines) {
  const actual = checksumOf(baseline.file);
  if (actual !== baseline.checksum) {
    errors.push(
      `Baseline checksum drift: ${baseline.file} hashes to ${actual} but BASELINE.md pins ${baseline.checksum}. ` +
        "If the requirements changed, follow the re-baselining procedure in tracker/README.md.",
    );
  }
}

const requirements = baselines.flatMap((b) => parseRequirements(b.file, b.families));
const requirementIds = new Set(requirements.map((r) => r.id));

const trackedIds = new Set();
for (const family of Object.keys(SECTIONS)) {
  const file = path.join(TRACKER_DIR, "sections", `${family}.md`);
  if (!existsSync(file)) continue;
  const rows = parseSectionRows(readFileSync(file, "utf8"));
  for (const row of rows) {
    if (trackedIds.has(row.id)) errors.push(`Duplicate tracker row: ${row.id}`);
    trackedIds.add(row.id);
    if (!requirementIds.has(row.id)) {
      errors.push(`Tracker row ${row.id} (${family}.md) does not exist in the baseline document.`);
    }
    if (!VALID_STATUSES.includes(row.status)) {
      errors.push(`Row ${row.id} has invalid status "${row.status}".`);
    }
    if (row.status === "done" && row.notes.length < 10) {
      errors.push(`Row ${row.id} is marked done without a verification note.`);
    }
  }
}

for (const id of requirementIds) {
  if (!trackedIds.has(id)) {
    errors.push(`Requirement ${id} from the baseline has no tracker row. Run: node tracker/scripts/generate.mjs`);
  }
}

if (errors.length > 0) {
  console.error(`Tracker validation FAILED (${errors.length} problem${errors.length === 1 ? "" : "s"}):\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `Tracker OK: ${trackedIds.size} rows cover ${requirementIds.size} requirements; ` +
    `${baselines.length} baseline${baselines.length === 1 ? "" : "s"} (${baselines
      .map((b) => `v${b.version}`)
      .join(", ")}) checksum-verified.`,
);
