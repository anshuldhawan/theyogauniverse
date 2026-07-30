/**
 * Extracts the prototype dataset (25 listings, verified list, start-here
 * paths, blog posts) from docs/design/The Yoga Universe.dc.html into
 * src/data/seed/prototype.json.
 *
 * Deterministic and re-runnable; the prototype file is the source of truth
 * for this dev/demo dataset (real data arrives via the ING pipeline).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(path.join(root, "docs/design/The Yoga Universe.dc.html"), "utf8");

const start = html.indexOf("const LISTINGS = [");
const end = html.indexOf("const KINDS = ");
if (start === -1 || end === -1) {
  throw new Error("Could not locate the prototype data block in the design HTML.");
}

const source = html.slice(start, end);
const context = {};
vm.createContext(context);
vm.runInContext(
  `${source}\nresult = { LISTINGS, VERIFIED, START_PATHS, MONEY, BOOKABLE, POSTS };`,
  context,
);

const out = path.join(root, "src/data/seed/prototype.json");
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(context.result, null, 2) + "\n");

const r = context.result;
console.log(
  `Extracted ${r.LISTINGS.length} listings, ${r.VERIFIED.length} verified, ` +
    `${r.START_PATHS.length} start paths, ${r.POSTS.length} posts -> ${path.relative(root, out)}`,
);
