# Sprint 06 Phase 7: Resume Engine Implementation Plan

This plan details the read-only, idempotent Resume Engine responsible for perfectly restoring the in-progress execution state without re-randomizing, mutating, or advancing the database.

## User Review Required

> [!NOTE]
> **OpenAPI Contract Gap**
> A comprehensive search of the `106_ASSESSMENT_EXECUTION_OPENAPI_v1.0` document confirmed that **NO** Resume endpoints exist in the specification. Therefore, in strict compliance with the architecture rules, I will not invent public APIs or Controllers. The Resume Engine will be fully implemented as a pure, internal Domain Service stack.

## Proposed Changes

### 1. DTOs and Exceptions
#### `app/Modules/Delivery/DTOs/ResumeDto.php`
- `readonly class ResumeDto`
- Fields: `attemptUuid`

#### `app/Modules/Delivery/DTOs/ResumeResultDto.php`
- `readonly class ResumeResultDto`
- Fields: `attemptUuid`, `snapshotUuid`, `snapshotSchemaVersion`, `randomizationSeed`, `questionOrder`, `optionOrder`, `draftAnswers`, `answeredQuestions`, `totalQuestions`, `completionPercentage`, `remainingSeconds`, `expiresAt`, `serverTime`.

#### `app/Modules/Delivery/Exceptions/ResumeException.php`
- Exception codes: `ATTEMPT_NOT_FOUND`, `INVALID_RESUME_STATE`, `ATTEMPT_EXPIRED`, `ATTEMPT_SUBMITTED`, `SNAPSHOT_NOT_FOUND`, `RANDOMIZATION_DATA_MISSING`, `RESUME_NOT_ALLOWED`.

### 2. Services
#### `app/Modules/Delivery/Services/AttemptRecoveryService.php`
- Validates tenant access (`organizationId`, `userId`).
- Validates attempt state: permits only `CREATED` or `IN_PROGRESS`/`STARTED`.
- Extracts Snapshot configurations checking for missing `snapshot_json` (Throws `SNAPSHOT_NOT_FOUND`).
- Validates Randomization metrics (`question_order_json`, etc.). Throws `RANDOMIZATION_DATA_MISSING` if incomplete.
- Invokes `TimerPolicyHelper`. If `canContinue()` is false, throws `ATTEMPT_EXPIRED`.

#### `app/Modules/Delivery/Services/DraftRecoveryService.php`
- Queries `candidate_answers` mapping to the `assessment_attempt_id`.
- Returns a clean array mapping `snapshot_question_uuid` -> `[payload, version, saved_at]`. 
- Since Auto-Save implements Lazy Materialization of `attempt_questions`, we can confidently join `candidate_answers` with `attempt_questions` to retrieve the `snapshot_question_uuid`.

#### `app/Modules/Delivery/Services/ResumeEngineService.php`
- Core Orchestrator.
- Calls `AttemptRecoveryService` and `DraftRecoveryService`.
- Parses `snapshot_json` strictly to count `totalQuestions` dynamically.
- Calculates `answeredQuestions` directly from recovered `candidate_answers` count.
- Derives `completionPercentage` purely as a view model scalar.
- Constructs and returns `ResumeResultDto`.
- **Enforces READ ONLY Execution:** No transactions. No updates to timestamps.

### 3. Audit Findings
- No `AttemptAudit` or `ResumeAudit` tables exist. This gap will be explicitly documented within the completion report. No fake logs will be generated.

### 4. Automated Tests
#### `tests/Unit/Modules/Delivery/Services/ResumeEngineServiceTest.php`
- Proves pure idempotency (multiple calls return identical `ResumeResultDto`).
- Verifies Timer integration accurately denies expired attempts.
- Verifies Snapshot and Randomization recovery guards.
- Validates cross-tenant boundaries.
- Asserts zero database mutations occur during the execution cycle.
- Calculates correct `completionPercentage` against mock snapshot structures.

## Verification Plan
- Run `php artisan test --filter ResumeEngineServiceTest` to validate all recovery strategies, immutability, and state bounds securely without mutating execution persistence.
