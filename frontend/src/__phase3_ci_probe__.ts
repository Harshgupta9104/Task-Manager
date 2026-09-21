// ⚠️ Temporary file — Phase 3 validation probe. Do not merge.
// The intentional type error below makes `tsc -b` (npm run build) fail so the
// required `frontend` status check fails, verifying that the branch protection
// ruleset blocks merging when CI is red. This branch will be deleted after the
// check is verified.
const phase3Probe: number = "intentional type error — Phase 3 CI gate validation";

export {};
