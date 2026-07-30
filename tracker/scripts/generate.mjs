/**
 * Bootstraps/refreshes tracker/sections/*.md from the baseline requirements
 * document, preserving any existing status/phase/notes. Also regenerates the
 * rollup table inside tracker/TRACKER.md between the ROLLUP markers.
 *
 * Run after re-baselining to a new requirements version.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import {
  SECTIONS,
  TRACKER_DIR,
  readBaselines,
  baselineByFamily,
  parseRequirements,
  parseSectionRows,
  compareIds,
} from "./lib.mjs";

const DEFAULT_PHASE = {
  DM: "1", NG: "—", ACC: "1", PRO: "2", CRD: "2", LST: "2", SCH: "3",
  SRCH: "2", BKG: "3", PAY: "3", WVR: "3", REV: "3", MSG: "3", DASH: "4",
  ING: "4", SEO: "2", TSF: "4", ADM: "4", ANL: "4", INT: "4", WEB: "4",
  NFR: "4", COMP: "4", LOC: "2", BLG: "B",
};

const baselines = readBaselines();
const owners = baselineByFamily();
const requirements = baselines.flatMap((b) => parseRequirements(b.file, b.families));

const byFamily = new Map();
for (const req of requirements) {
  if (!byFamily.has(req.family)) byFamily.set(req.family, []);
  byFamily.get(req.family).push(req);
}

let total = 0;
for (const [family, title] of Object.entries(SECTIONS)) {
  const reqs = (byFamily.get(family) ?? []).sort((a, b) => compareIds(a.id, b.id));
  if (reqs.length === 0) continue;
  total += reqs.length;

  const file = path.join(TRACKER_DIR, "sections", `${family}.md`);
  const existing = existsSync(file)
    ? new Map(parseSectionRows(readFileSync(file, "utf8")).map((r) => [r.id, r]))
    : new Map();

  const owner = owners.get(family);
  const lines = [
    `# ${family} — ${title}`,
    "",
    `Baseline: **v${owner.version}** (\`${owner.file}\`). ${reqs.length} requirements.`,
    "",
    "Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.",
    "A `done` row must carry a verification note (and PR link once the repo has a remote).",
    "",
    "| ID | Status | Phase | Notes |",
    "|---|---|---|---|",
  ];
  for (const req of reqs) {
    const prev = existing.get(req.id);
    const status = prev?.status ?? (req.removed ? "n-a" : "todo");
    const phase = prev?.phase ?? DEFAULT_PHASE[family] ?? "—";
    const notes = prev?.notes ?? (req.removed ? "Struck through in the PRD (removed in v1.1)." : "");
    lines.push(`| ${req.id} | ${status} | ${phase} | ${notes} |`);
  }
  writeFileSync(file, lines.join("\n") + "\n");
}

// Regenerate the rollup in TRACKER.md between markers.
const trackerFile = path.join(TRACKER_DIR, "TRACKER.md");
if (existsSync(trackerFile)) {
  const rollupLines = [
    "| Section | Total | Done | In progress | Blocked | Deferred | N/A | Todo |",
    "|---|---|---|---|---|---|---|---|",
  ];
  let sums = { total: 0, done: 0, prog: 0, blocked: 0, deferred: 0, na: 0, todo: 0 };
  for (const family of Object.keys(SECTIONS)) {
    const file = path.join(TRACKER_DIR, "sections", `${family}.md`);
    if (!existsSync(file)) continue;
    const rows = parseSectionRows(readFileSync(file, "utf8"));
    const count = (s) => rows.filter((r) => r.status === s).length;
    const c = {
      total: rows.length, done: count("done"), prog: count("in-progress"),
      blocked: count("blocked"), deferred: count("deferred"), na: count("n-a"), todo: count("todo"),
    };
    for (const k of Object.keys(sums)) sums[k] += c[k];
    rollupLines.push(
      `| [${family}](sections/${family}.md) | ${c.total} | ${c.done} | ${c.prog} | ${c.blocked} | ${c.deferred} | ${c.na} | ${c.todo} |`,
    );
  }
  rollupLines.push(
    `| **All** | **${sums.total}** | **${sums.done}** | **${sums.prog}** | **${sums.blocked}** | **${sums.deferred}** | **${sums.na}** | **${sums.todo}** |`,
  );
  const text = readFileSync(trackerFile, "utf8");
  const updated = text.replace(
    /<!-- ROLLUP:START -->[\s\S]*<!-- ROLLUP:END -->/,
    `<!-- ROLLUP:START -->\n${rollupLines.join("\n")}\n<!-- ROLLUP:END -->`,
  );
  writeFileSync(trackerFile, updated);
}

console.log(
  `Tracker refreshed: ${total} requirements across ${byFamily.size} sections ` +
    `(${baselines.map((b) => `v${b.version}`).join(" + ")}).`,
);
