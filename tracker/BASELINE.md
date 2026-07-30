# Active requirements baselines

The tracker is pinned to exact versions of the requirements documents. Every
status in `tracker/sections/` is asserted **against these versions and no
other**. Module baselines declare a **Prefix:** — the requirement families
they own; the parent baseline owns every family not claimed by a module.

## Parent — platform requirements

- **File:** `docs/requirements/yoga-platform-requirements-v1.2.md`
- **Version:** 1.2
- **Baseline date:** 28 July 2026
- **SHA-256:** `505bb3c682bb0089aaaed2a60fe49c703fb4c098d7b78d4afa418e9b15b15bd8`

## Module — Editorial & Blog (BLG)

- **File:** `docs/requirements/yoga-platform-blog-module-requirements-v1.0.md`
- **Version:** 1.0
- **Prefix:** BLG
- **Baseline date:** 28 July 2026
- **SHA-256:** `137ad3ebacda8f834a9eef91c21fbc4d2c7086cac9c2bbd00f5b94008688cd23`

CI runs `node tracker/scripts/validate.mjs`, which fails the build if any file
above no longer hashes to its checksum, or if the tracker and the documents
disagree about which requirement IDs exist. Editing a requirements document
therefore **requires** a re-baseline in the same commit — see
[README.md](README.md) for the procedure.

Previous versions (`v1`, `v1.1`) are retained in `docs/requirements/` for
reference. Note the v1.2 changelog's warning: four PAY IDs were **reused with
different meanings** between v1.1 and v1.2 — any note or ticket citing a v1.1
PAY number must be re-read against v1.2 rather than assumed.

The blog module (v1.0) flags a parent-spec defect: SEO-2 and SEO-6 describe
`FAQPage` markup as a rich-result mechanism, but Google deprecated FAQ rich
results in May 2026 and removed them in June 2026. Raise as a correction in a
future v1.3 of the parent document; noted on the SEO-2/SEO-6 tracker rows.
