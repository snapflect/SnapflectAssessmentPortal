# Sprint 06 Phase 5: Timer Engine Implementation Plan

This plan details the server-authoritative Timer Engine, which strictly calculates remaining time and expiration based on UTC server timestamps, ensuring frontend timers remain purely visual and cannot manipulate assessment duration.

## User Review Required

> [!WARNING]
> **Database Fields Clarification**
> The rules state to verify the existence of `attempt_started_at`, `attempt_expires_at`, and `current_state`. 
> 
> Inspecting the `assessment_attempts` table schema from Phase 1-4, the exact fields currently exist as:
> - `started_at`
> - `expires_at`
> - `status`
> 
> Because these existing columns serve the exact semantic purpose required, I will map the Timer Engine to use `started_at`, `expires_at`, and `status`. I will not create a new migration to duplicate these fields unless you explicitly require the exact string names `attempt_started_at`. **Please confirm this mapping is acceptable.**

> [!NOTE]
> **OpenAPI Discrepancy**
> The rule states to verify the route `GET /api/v1/attempts/{attempt_uuid}/timer` against `106_ASSESSMENT_EXECUTION_OPENAPI_v1.0`. A review of the OpenAPI specification revealed no mention of "timer". However, I will strictly implement the requested route `/api/v1/attempts/{attempt_uuid}/timer` as commanded.

## Proposed Changes

### 1. DTOs and Exceptions
#### `app/Modules/Delivery/DTOs/TimerStatusDto.php`
- `readonly class TimerStatusDto`
- Fields: `attemptUuid`, `currentState`, `startedAt`, `expiresAt`, `remainingSeconds`, `expired`, `gracePeriodSeconds`, `serverTime`.
- Ensures internal IDs are hidden.

#### `app/Modules/Delivery/Exceptions/TimerExpiredException.php`
- Exception codes: `ATTEMPT_EXPIRED`, `ATTEMPT_NOT_STARTED`, `INVALID_TIMER_STATE`, `TIMER_CONFIGURATION_ERROR`.

### 2. Helpers & Policies
#### `app/Modules/Delivery/Helpers/TimerPolicyHelper.php`
- `canContinue(AssessmentAttempt $attempt): bool`
- `isExpired(AssessmentAttempt $attempt): bool`
- `canSubmit(AssessmentAttempt $attempt): bool`
- `remainingSeconds(AssessmentAttempt $attempt): int`
- Extracts config `assessment.grace_period_seconds` (default 0) to append to the expiration threshold.

### 3. Services
#### `app/Modules/Delivery/Services/AttemptTimerService.php`
- `startTimer(AssessmentAttempt $attempt, int $durationMinutes): void`
  - Sets `started_at = now()`, `expires_at = now()->addMinutes($durationMinutes)`, `status = 'STARTED'`.
  - Can only transition from `CREATED` -> `STARTED`.
- `getTimerStatus(string $attemptUuid, int $orgId, int $userId): TimerStatusDto`
  - Retrieves the attempt efficiently.
  - Returns calculated `remaining_seconds` against strictly `now()`.
  - Automatically triggers expiration if time is up.
- `expireAttempt(AssessmentAttempt $attempt): void`
  - Runs in `DB::transaction()`.
  - Sets `status = 'EXPIRED'`.
  - Idempotent: If already `EXPIRED`, returns silently without throwing or redundant updates.

### 4. API & Controllers
#### `app/Modules/Delivery/Controllers/TimerController.php`
- `GET /api/v1/attempts/{attempt_uuid}/timer`
- Injects `$organizationId` and `$userId` safely.
- Returns serialization via `TimerResource`.

#### `app/Modules/Delivery/Resources/TimerResource.php`
- Formats `TimerStatusDto` to standard JSON response.

#### `routes/modules/delivery.php`
- Add route `GET /attempts/{attempt_uuid}/timer` pointing to `TimerController`.

### 5. Config Setup
- Ensure `config/assessment.php` has a `grace_period_seconds` key. If the config file does not exist, standard Laravel `config('assessment.grace_period_seconds', 0)` fallback will be used natively.

### 6. Audit Gap
- `AttemptAudit` tables do not exist in the current codebase. As instructed, I will document this gap and will not introduce temporary logs.

### 7. Automated Tests
#### `tests/Unit/Modules/Delivery/Services/AttemptTimerServiceTest.php`
- Test calculation logic, authoritative server time overrides, grace periods, and idempotent expirations.

#### `tests/Feature/Modules/Delivery/API/TimerFeatureTest.php`
- Tests `GET /api/v1/attempts/{attempt_uuid}/timer` endpoint functionality, tenant isolation, and JSON structures.

## Verification Plan
- Run `php artisan test --filter AttemptTimerServiceTest`
- Run `php artisan test --filter TimerFeatureTest`
