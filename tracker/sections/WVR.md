# WVR — Waivers, Health Intake & Liability (§7.9)

Baseline: **v1.2** (`docs/requirements/yoga-platform-requirements-v1.2.md`). 8 requirements.

Statuses: `todo` | `in-progress` | `done` | `blocked` | `deferred` | `n-a`.
A `done` row must carry a verification note (and PR link once the repo has a remote).

| ID | Status | Phase | Notes |
|---|---|---|---|
| WVR-1 | blocked | 3 | state/provider template selection hard-gates on counselApprovedAt (src/lib/waivers.ts; tested); current text is explicitly a placeholder and no state counsel approvals are present |
| WVR-2 | in-progress | 3 | immutable template/signature matching, timestamp/IP model, re-signature decision, and printable retrieval artifact tested; actual PDF route/storage pending |
| WVR-3 | in-progress | 3 | required-format policy covers prenatal/therapeutic/hot/aerial/breathwork/ice exposure (tested); encrypted intake form and listing/checkout integration pending |
| WVR-4 | in-progress | 3 | booking/provider/key-scope/retention access decision with mandatory read-audit payload tested; production encryption key service and durable audit logging pending |
| WVR-5 | in-progress | 3 | under-16 rejection and guardian-consent validation tested; account/checkout integration pending |
| WVR-6 | in-progress | 3 | retreat/training emergency-contact requirement tested; capture UI and persistence pending |
| WVR-7 | in-progress | 3 | per-format warnings for breathwork/ice/hot/inversions/aerial and other high-risk formats tested; pre-booking UI surfacing pending |
| WVR-8 | done | 3 | enquiry flow collects no waiver; confirmation states we are not party to the contract (BKG-20 copy) |
