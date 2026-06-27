# Sprint 06 Phase 8: Submission Engine

## Files Created
- `app/Modules/Delivery/DTOs/SubmitAttemptDto.php`
- `app/Modules/Delivery/DTOs/SubmissionResultDto.php`
- `app/Modules/Delivery/Exceptions/SubmissionException.php`
- `app/Modules/Delivery/Services/SubmissionValidationService.php`
- `app/Modules/Delivery/Services/AttemptFinalizationService.php`
- `app/Modules/Delivery/Services/SubmissionEngineService.php`
- `tests/Unit/Modules/Delivery/Services/SubmissionEngineServiceTest.php`

## Files Modified
- `implementation_plan_sprint06_phase08.md`

## Schema Investigation & Evidence Strategy
A critical investigation of the `attempt_submissions` migration confirmed it possesses authoritative receipt metrics (such as `total_answered`, `submission_type`, and `submission_reference`). Thus, the architecture implements **Option B**:
1. The **Execution Lock** occurs intrinsically on `assessment_attempts` by switching `status = SUBMITTED` preventing any execution engines (Save, Resume) from reading the attempt.
2. The **Submission Evidence Receipt** is instantiated simultaneously as a row in `attempt_submissions`, safely logging the unalterable footprint of finalization within the same transaction lock.

## Business Logic Implemented
The Submission Engine finalizes execution permanently. It consumes the Attempt state and triggers violent rollbacks against partial executions (via Snapshot, Randomization, and Draft validation). If structurally secure, it generates the submission evidence mapping UTC metrics precisely without exposing the execution flow back to the candidate.

## Immutability & Idempotency Enforcement
Idempotency is structurally mapped using rapid Short-Circuiting. Before processing complex integrity validations, the service pulls the `SUBMITTED` state, and upon detecting a duplicate API retry, effortlessly returns the historical `SubmissionResultDto` without engaging the persistence layer.

Rigorous test cases (`test_resume_denied_after_submission`, `test_auto_save_denied_after_submission`) guarantee that post-finalization, the `status = SUBMITTED` flag comprehensively blocks downstream domain services from resuming tracking or permitting draft overrides, cementing an impregnable immutability boundary.

## Timer Integration Strategy
Because candidates may legally timeout, expiration natively fails explicit submits but flawlessly reroutes through an `AUTO_FINALIZED` type. It prevents infinite loops while cleanly wrapping abandoned attempts without expanding their time histories.

## Deep Valdation Matrices (Snapshot, Randomization, Drafts)
Prior to committing finalization blocks, `SubmissionValidationService` maps structural limits mirroring Phase 7 checks to ensure corrupted tests (e.g. duplicate random order UUIDs, deleted snapshot nodes, orphan draft answers) fail explicitly with respective Exception matrices, shielding the Scoring engines from catastrophic data inputs downstream.

## Security & API Findings
- **Security Validation:** Tenant validation forces explicit `$userId` and `$organizationId` crosschecks identically to prior phases. 
- **OpenAPI Gap:** No `/submit` endpoint resides within `106_ASSESSMENT_EXECUTION_OPENAPI_v1.0`. Strictly observing rules, no Controllers or API Routes were authored; the service remains purely an Internal Domain Engine.
- **Audit Findings:** No natively aligned Submission Audit repositories are constructed inside the legacy tables. This finding holds true with prior phases.

## Test Boundaries Passed
Aggressively deployed Unit mapping for Submission Validation:
- Accurate evidence persistence (`attempt_submissions` mapped seamlessly).
- Zero-DB queries enforced on duplicate API submissions (Short-Circuit Idempotency).
- Expired attempt auto-finalized bypass loops.
- Auto Save & Resume Lockout denials immediately post-submission.
- Structural corruption blocks resolving explicitly to exception cascades.

## Final Verdict
Sprint 06 Phase 8 **Submission Engine** delivered. Seamlessly locking the Execution phase cleanly via transactional idempotency, the Engine ensures flawless Submission boundary enforcement without circumventing OpenAPI boundaries. This effectively terminates the active Candidate Session Pipeline successfully mapping all 11 corrections comprehensively.
