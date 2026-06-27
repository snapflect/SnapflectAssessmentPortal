# Sprint 06 Phase 8: Submission Engine Implementation Plan

This phase builds the absolute boundary of the execution lifecycle, rigidly locking an attempt and severing all further Auto Save and Resume access.

## User Review Required

> [!NOTE]
> **OpenAPI Contract Gap**
> As with the previous phases, an exhaustive search of `106_ASSESSMENT_EXECUTION_OPENAPI_v1.0` confirms that **NO** explicit Submission endpoints exist. The engine will therefore strictly behave as a backend Domain Service and orchestrator. I will document this Contract Gap and will not expose public Controllers, Routes, or REST Resources.

> [!WARNING]
> **Database Schema Findings**
> Inspection of the schema confirms `assessment_attempts` possesses `submitted_at` natively. Additionally, a separate `attempt_submissions` table exists in migrations (`2026_06_20_000308_create_attempt_submissions_table.php`). However, per your explicit directive ("*Persist submitted_at. Persist status.*" inside the Attempt), I will implement the execution lock directly onto the `assessment_attempts` entity to finalize execution. If you require me to additionally construct a separate row inside the `attempt_submissions` table alongside the attempt lock, please clarify; otherwise, the lock occurs purely on the Attempt entity to enforce the state machine.

## Proposed Changes

### 1. DTOs & Exceptions
#### `app/Modules/Delivery/DTOs/SubmitAttemptDto.php`
- `readonly class SubmitAttemptDto` containing purely `attemptUuid`.

#### `app/Modules/Delivery/DTOs/SubmissionResultDto.php`
- `readonly class SubmissionResultDto` containing `attemptUuid`, `snapshotUuid`, `submittedAt`, `finalStatus`, `answeredQuestions`, `totalQuestions`, `completionPercentage`. No internal DB IDs.

#### `app/Modules/Delivery/Exceptions/SubmissionException.php`
- Encompasses `INVALID_SUBMISSION_STATE`, `SNAPSHOT_NOT_FOUND`, `RANDOMIZATION_DATA_CORRUPTED`, `DRAFT_DATA_CORRUPTED`, `ATTEMPT_CANCELLED`. 
- (Note: `ATTEMPT_ALREADY_SUBMITTED` is handled gently by returning early per idempotency rules, rather than throwing).

### 2. Services
#### `app/Modules/Delivery/Services/SubmissionValidationService.php`
- **Timer Validation:** Evaluates via `TimerPolicyHelper`. Expired timers explicitly permit the Auto-Finalization path without throwing errors.
- **Snapshot Validation:** Fails violently if `snapshot_json`, `snapshot_hash`, or `snapshot_schema_version` are missing.
- **Randomization Validation:** Validates `randomization_seed`, counts, and UUID integrity mapping perfectly to the Snapshot tree.
- **Draft Validation:** Validates `candidate_answers`. Evaluates that every answered `question_uuid` correctly exists within the snapshot payload.

#### `app/Modules/Delivery/Services/AttemptFinalizationService.php`
- Enacts the core lock. Updates `assessment_attempts.status = 'SUBMITTED'` and sets `submitted_at = now()`.

#### `app/Modules/Delivery/Services/SubmissionEngineService.php`
- **Idempotency Guard:** Detects if status is already `SUBMITTED`. If true, bypasses recalculation and instantly returns the existing successful `SubmissionResultDto`.
- **Transaction:** Wraps Validation + Finalization strictly within `DB::transaction()` to guarantee complete rollback of partial state failures.
- **View Models:** Summates $totalQuestions$ from snapshot and $answeredQuestions$ from draft recovery to synthesize `$completionPercentage`.

### 3. Audit Findings
- No `SubmissionAudit` tables are verified to exist for execution contexts. Gap will be documented.

### 4. Automated Tests
#### `tests/Unit/Modules/Delivery/Services/SubmissionEngineServiceTest.php`
- Proves pure idempotency (duplicate submissions skip writes and return 200 equivalent payload).
- Expired attempt auto-finalized perfectly (bypass strict timer block if intending to submit).
- Snapshot / Randomization / Draft corruption safely abort the transaction and rollback locks.
- Verifies post-submission locks perfectly reject Auto Save and Resume processes downstream.
- Asserts strict Cross-Tenant isolation boundaries.

## Verification Plan
- `php artisan test --filter SubmissionEngineServiceTest` to ensure state is locked immutably, ensuring neither the frontend nor API bypass mechanisms can alter the execution history post-submission.
