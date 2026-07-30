# Project tracker

Requirement-level progress for The Yoga Universe platform, keyed to the requirement
IDs in the baseline PRD (see [BASELINE.md](BASELINE.md), currently **v1.2**).
This directory is the source of truth for build status; it is updated **in the
same PR** as the work it tracks.

## Layout

| File | Purpose |
|---|---|
| `BASELINE.md` | Pins the active requirements version + SHA-256 checksum |
| `TRACKER.md` | Rollup: per-section progress, phases, open business decisions |
| `sections/{FAMILY}.md` | One row per requirement ID: status, phase, notes |
| `scripts/validate.mjs` | CI integrity check (checksum + ID coverage + status hygiene) |
| `scripts/generate.mjs` | Bootstraps/refreshes section files from the baseline doc, preserving statuses |

## Statuses

- `todo` — not started.
- `in-progress` — partially implemented; the note says what exists and what is missing.
- `done` — implemented and verified. **Requires a verification note** (what was
  checked, and a PR link once the repo has a remote). CI rejects noteless `done` rows.
- `blocked` — cannot proceed; the note names the blocker (usually an Open
  Business Decision or a counsel item, tracked in `TRACKER.md`).
- `deferred` — deliberately out of the current build (e.g. Decision #16 items).
- `n-a` — not applicable, e.g. requirements struck through in the PRD itself
  (PRO-8, DASH-6).

`done` means the requirement as written in the **baseline version** — not an
approximation of it. When only part of a requirement exists, the row stays
`in-progress` with an honest note.

## Working rules

1. Every implementation, behavior change, fix, refactor, integration, security
   update, or SEO/AEO update must update every affected requirement row in the
   same change. The note records what exists, how it was verified, and what
   remains. A change is not complete while code and tracker disagree.
2. If work materially changes the implementation but does not map to an
   existing requirement ID, record it under **Unmapped implementation changes**
   in `TRACKER.md`; never invent a requirement ID.
3. When statuses change, regenerate the rollup and run
   `pnpm tracker:validate`. Never edit generated rollup counts by hand.
4. Never edit `docs/requirements/*.md` casually — the checksum gate exists to
   force the re-baselining procedure below.
5. A requirement that a proposal would violate (most often a PAY-17a
   constraint) gets a note, and the proposal is routed to Legal per PAY-12 —
   the tracker records that this happened.

Pure formatting, typo-only documentation edits, and generated artifacts are
exempt unless they change documented behavior or requirement status.

## Re-baselining to a new requirements version (e.g. v1.3)

1. Add the new document to `docs/requirements/` (never overwrite the old one).
2. Read its **changelog section first**. List: added IDs, removed IDs,
   renumbered IDs, and — most dangerous — **reused** IDs (same ID, different
   meaning; v1.2 did this to four PAY numbers).
3. Update `BASELINE.md`: file path, version, date, new SHA-256
   (`shasum -a 256 <file>`).
4. Run `node tracker/scripts/generate.mjs`. It adds rows for new IDs
   (as `todo`) and preserves existing statuses. It does **not** delete rows for
   removed IDs — the validator will flag them; resolve each one by hand.
5. For every ID the changelog marks changed/reused: re-read the requirement,
   then either keep the status (meaning unchanged), downgrade `done` →
   `in-progress`/`todo` (meaning changed), or move notes to the requirement's
   new home (renumbered).
6. Run `node tracker/scripts/validate.mjs` until clean. Commit the re-baseline
   as its own PR titled `re-baseline: requirements vX.Y`, listing every status
   that was downgraded and why.
