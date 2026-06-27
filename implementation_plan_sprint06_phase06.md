# Sprint 06 Phase 6: Auto Save Engine Implementation Plan

This plan details the purely transactional, idempotent Auto Save Engine designed to lock in incremental progress dynamically, entirely shielded by the `TimerPolicyHelper` authoritative bounds.

## User Review Required

> [!WARNING]
> **Database Schema Findings & Minimal Migration Strategy**
> The rules instructed to verify the existence of `attempt_answers`, `draft_answers`, `assessment_answers`, or equivalents. 
> 
> My investigation found `candidate_answers` which contains heavy foreign key constraints against `attempt_questions` and `attempt_sections`. Since we dynamically load questions directly from the JSON snapshot and do not currently have an engine that pre-seeds the entire `attempt_questions` relational tree upon Session Launch, forcing saves into `candidate_answers` would either require redesigning the tables or building a heavy lazy-initialization engine.
> 
> **Proposed Solution**: I will create a minimal, standalone `draft_answers` table exactly as outlined in your instructions ("Persist: attempt_uuid, question_uuid, answer_payload, saved_at, last_activity_at").
> - `uuid`
> - `assessment_attempt_id`
> - `question_uuid` (maps directly to snapshot structure)
> - `answer_payload` (json)
> - `draft_version` (integer for optimistic concurrency)
> - `saved_at`, `last_activity_at`
> 
> This perfectly handles the sparse nature of draft states without altering unrelated tables or triggering foreign key violations. **Please confirm if this migration is approved.**

> [!NOTE]
> **OpenAPI Contract Gap**
> A thorough search of the `106_ASSESSMENT_EXECUTION_OPENAPI_v1.0` document confirmed that **NO** Auto Save endpoints exist natively in the specification. Therefore, following your instructions, I have explicitly documented this gap and will implement the engine purely as internal backend Domain Services without exposing a public REST API or Controller at this time.

## Proposed Changes

### 1. Migrations
**`create_draft_answers_table`**
- Lightweight table tracking `attempt_id`, `question_uuid`, `answer_payload`, `draft_version`, and timestamps.
- Uniquely indexed on `[assessment_attempt_id, question_uuid]` to guarantee "Latest Save Wins" idempotency via `updateOrCreate` logic.

### 2. DTOs and Exceptions
#### `app/Modules/Delivery/DTOs/AutoSaveDto.php`
- `readonly class AutoSaveDto`
- Fields: `attemptUuid`, `questionUuid`, `answerPayload`, `clientDraftVersion`

#### `app/Modules/Delivery/DTOs/AutoSaveResultDto.php`
- `readonly class AutoSaveResultDto`
- Fields: `attemptUuid`, `questionUuid`, `answerUuid`, `savedAt`, `serverDraftVersion`, `success`

#### `app/Modules/Delivery/Exceptions/AutoSaveException.php`
- Exception codes: `ATTEMPT_EXPIRED`, `ATTEMPT_SUBMITTED`, `INVALID_ATTEMPT_STATE`, `STALE_DRAFT_VERSION`, `QUESTION_NOT_FOUND`, `ATTEMPT_NOT_FOUND`, `SAVE_FAILED`.

### 3. Services
#### `app/Modules/Delivery/Services/DraftStateService.php`
- Responsibilities: Validating optimistic concurrency via `clientDraftVersion` against the database row. Bumping `draft_version` by 1 on successful updates.

#### `app/Modules/Delivery/Services/AnswerPersistenceService.php`
- Formats payload storage depending on question type (extracting single/multiple choices, texts natively into the JSON structure without scoring).

#### `app/Modules/Delivery/Services/AutoSaveService.php`
- Core Orchestrator.
- Evaluates `TimerPolicyHelper::canContinue(attempt)`. Throws `ATTEMPT_EXPIRED` if false.
- Checks attempt status (rejecting `SUBMITTED`, `EXPIRED`, `CANCELLED`).
- Runs `DB::transaction()` to invoke `DraftStateService` and `AnswerPersistenceService` and commits the latest save exclusively.

### 4. Audit Gaps
- `AnswerAudit`, `DraftAudit`, `AttemptAudit` do not exist. Gap documented. No fake logs generated.

### 5. Automated Tests
#### `tests/Unit/Modules/Delivery/Services/AutoSaveServiceTest.php`
- Validates single/multiple/text saves.
- Proves idempotency (repeated identical saves update same record).
- Validates "Latest Save Wins" sequence.
- Triggers optimistic concurrency rejection (`STALE_DRAFT_VERSION`).
- Rejects expired/submitted attempts safely.
- Ensures rollback mechanisms trigger accurately.

## Verification Plan
- Run `php artisan test --filter AutoSaveServiceTest` to validate optimistic concurrency and timer boundary rules prior to saves.
