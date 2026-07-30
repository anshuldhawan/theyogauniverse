/**
 * Update tracker rows from the command line:
 *   node tracker/scripts/set.mjs DM-1 done "teaches_at is m2m + time-bounded (src/db/schema.ts)"
 *   node tracker/scripts/set.mjs DM-1,DM-2,DM-3 in-progress "note applies to all three"
 * Regenerates the TRACKER.md rollup afterwards via generate.mjs.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { TRACKER_DIR, VALID_STATUSES } from "./lib.mjs";

const [idsArg, status, note = ""] = process.argv.slice(2);
if (!idsArg || !status || !VALID_STATUSES.includes(status)) {
  console.error(
    `Usage: node tracker/scripts/set.mjs <ID[,ID…]> <${VALID_STATUSES.join("|")}> [note]`,
  );
  process.exit(1);
}

for (const id of idsArg.split(",").map((s) => s.trim())) {
  const family = id.split("-")[0];
  const file = path.join(TRACKER_DIR, "sections", `${family}.md`);
  const text = readFileSync(file, "utf8");
  const pattern = new RegExp(`^\\|\\s*${id}\\s*\\|[^|]*\\|([^|]*)\\|.*\\|\\s*$`, "m");
  const match = pattern.exec(text);
  if (!match) {
    console.error(`No tracker row for ${id} in ${file}`);
    process.exit(1);
  }
  const phase = match[1].trim();
  const updated = text.replace(pattern, `| ${id} | ${status} | ${phase} | ${note} |`);
  writeFileSync(file, updated);
  console.log(`${id} -> ${status}`);
}

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
execFileSync("node", [path.join(scriptsDir, "generate.mjs")], { stdio: "inherit" });
