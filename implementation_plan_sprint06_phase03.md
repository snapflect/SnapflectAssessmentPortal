# Sprint 06 Phase 3: Session Launch Engine Implementation Plan

This plan details the business logic for safely launching assessments by generating immutable snapshots and mapping them to attempts, isolating active candidates from future assessment mutations.

## User Review Required

> [!WARNING]
> **Database Constraint Conflict Detected**
> The rules state that the Snapshot should be generated during the **LAUNCH FLOW**. However, the `assessment_sessions` table migration (`2026_06_20_000301_create_assessment_sessions_table.php`) defines `assessment_snapshot_id` as **NOT NULLABLE** (`$table->foreignId('assessment_snapshot_id')->constrained('assessment_snapshots')->restrictOnDelete();`). 
> 
> Because I am instructed to "Generate Snapshot" during Launch, I cannot insert a `DRAFT` Session without an `assessment_snapshot_id`.
> 
> **Proposed Solution**: I will generate the `AssessmentSnapshot` during the **Session Creation** flow instead of the Launch flow so that the non-nullable constraint is satisfied, or I can create a migration to alter the table to `nullable()`. **For this execution, I will generate the Snapshot during the SESSION CREATION FLOW unless instructed otherwise.**

## Proposed Changes

### 1. DTOs & Exceptions
#### `app/Modules/Delivery/DTOs/LaunchSessionDto.php`
- `readonly class LaunchSessionDto`
- Fields: `public string $sessionUuid`

#### `app/Modules/Delivery/DTOs/LaunchResultDto.php`
- `readonly class LaunchResultDto`
- Fields: `public string $sessionUuid`, `public string $attemptUuid`, `public string $snapshotUuid`, `public string $launchedAt`, `public string $launchedByUuid`

#### `app/Modules/Delivery/Exceptions/SessionLaunchException.php`
- Custom exception with constants: `ASSESSMENT_NOT_PUBLISHED`, `CANDIDATE_REQUIRED`, `SESSION_NOT_FOUND`, `SESSION_ALREADY_LAUNCHED`, `SESSION_CANCELLED`, `SNAPSHOT_GENERATION_FAILED`, `ATTEMPT_CREATION_FAILED`, `INVALID_SESSION_STATE`.

### 2. Services
#### `app/Modules/Assessment/Services/SnapshotGenerationService.php`
- `generate(Assessment $assessment, int $userId): AssessmentSnapshot`
- Eager loads the `blueprint.sections.sectionQuestions.question.options` and `competencies`.
- Serializes the entire hierarchy into a comprehensive `snapshot_json` payload.
- Calculates an SHA-256 `snapshot_hash` for immutability verification.

#### `app/Modules/Delivery/Services/AttemptCreationService.php`
- `createAttempt(AssessmentSession $session, AssessmentSnapshot $snapshot): AssessmentAttempt`
- Inserts attempt with `status = 'CREATED'`.
- Links snapshot, session, and assessment data.

#### `app/Modules/Delivery/Services/SessionLaunchService.php`
- **`createSession`**:
  - Validates assessment is `PUBLISHED`.
  - Generates snapshot via `SnapshotGenerationService` (to bypass nullable constraint).
  - Persists `AssessmentSession` as `DRAFT`.
- **`launchSession`**:
  - Validates session is `DRAFT` (or returns idempotent if `LAUNCHED`).
  - Calls `AttemptCreationService` to generate the Attempt.
  - Updates Session status to `LAUNCHED` and `access_started_at`.
- All wrapped in `DB::transaction()`.

### 3. API & Controllers
#### `app/Modules/Delivery/Controllers/SessionLaunchController.php`
- `POST /api/v1/sessions`
- `POST /api/v1/sessions/{session_uuid}/launch`
- `GET /api/v1/sessions/{session_uuid}`

#### `app/Modules/Delivery/Resources/LaunchResultResource.php`
- Serializes `LaunchResultDto`.

#### `routes/api.php` & `routes/modules/delivery.php`
- To match exactly OpenAPI requirements (`/api/v1/sessions`), I will remove the `delivery` prefix in `api.php` if necessary, or simply mount the routes to ensure the exact path. Note: The prompt states `POST /api/v1/sessions`. The existing `delivery.php` currently mounts under `/api/v1/delivery/`. I will decouple it similar to Phase 2 to ensure absolute path correctness.

### 4. Audit Findings
I've discovered `AssessmentAttemptService`, but no dedicated `SessionAudit` infrastructure. As instructed, I will document this gap and will NOT introduce temporary logs or fake services.

### 5. Automated Tests
#### `tests/Unit/Modules/Delivery/Services/SessionLaunchServiceTest.php`
- State machine testing (DRAFT -> LAUNCHED -> CANCELLED).
- Snapshot immutability validation tests.
- DB Transaction rollback simulation.

#### `tests/Feature/Modules/Delivery/API/SessionLaunchFeatureTest.php`
- Controller endpoints integration tests.
- Tenant isolation validations.

## Verification Plan
- Run `php artisan test --filter SessionLaunchServiceTest`
- Run `php artisan test --filter SessionLaunchFeatureTest`
