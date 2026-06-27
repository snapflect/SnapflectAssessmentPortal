# Sprint 06 Phase 2: Assessment Publication Engine Implementation Plan

This plan outlines the real business logic implementation for the Publication Engine, strictly adhering to the state machine constraints and acting as a consumer of the Validation Engine.

## User Review Required

Please review the following decisions before execution:
- **Assessment Model State Field**: The `Assessment` model has both `current_state` and `status`, as well as `is_published`. I will use `status` as the single source of truth for the `DRAFT`, `READY`, `PUBLISHED`, `ARCHIVED` state machine. I will also update `is_published = true` when transitioning to `PUBLISHED`. Is this correct?
- **Routing Overrides**: The existing `assessment.php` routes file has placeholders for `publish` and `archive` under `AssessmentController`. I will repoint these to the new `AssessmentPublicationController` and add the `ready` endpoint.

> [!IMPORTANT]
> The Publication Engine will strictly execute all state transitions inside `DB::transaction()` to ensure atomicity and prevent partial updates.

## Proposed Changes

### 1. Data Transfer Objects (DTOs) & Exceptions

#### [NEW] `app/Modules/Assessment/DTOs/PublicationResultDto.php`
- `readonly class PublicationResultDto`
- Fields: `public string $assessmentUuid`, `public string $previousStatus`, `public string $currentStatus`, `public string $transitionedAt`, `public int $transitionedBy`

#### [NEW] `app/Modules/Assessment/Exceptions/AssessmentPublicationException.php`
- Custom exception with constants for error codes: `INVALID_TRANSITION`, `VALIDATION_REQUIRED`, `ASSESSMENT_NOT_READY`, `ASSESSMENT_ALREADY_PUBLISHED`, `ASSESSMENT_ALREADY_ARCHIVED`.

### 2. State Machine

#### [NEW] `app/Modules/Assessment/Services/PublicationStateMachine.php`
- Enforces the precise state machine rules (`DRAFT` -> `READY` -> `PUBLISHED` -> `ARCHIVED`).
- Provides the static helper `isMutable(string $status): bool` returning `true` for `DRAFT`/`READY` and `false` for `PUBLISHED`/`ARCHIVED`.

### 3. Validation Service Engine

#### [NEW] `app/Modules/Assessment/Services/AssessmentPublicationService.php`
- **Dependencies**: `AssessmentValidationService`, `AssessmentRepositoryInterface`.
- **Methods**:
  - `makeReady(string $uuid, int $organizationId, int $userId): PublicationResultDto`
    - Validates transition allowed (`DRAFT` -> `READY`).
    - Invokes `ValidationService::validate()`. If `!$result->readyForPublication`, throws `VALIDATION_REQUIRED`.
    - `DB::transaction()` updates status to `READY`.
  - `publish(string $uuid, int $organizationId, int $userId): PublicationResultDto`
    - Validates transition allowed (`READY` -> `PUBLISHED`).
    - `DB::transaction()` updates status to `PUBLISHED` (and `is_published = true`).
  - `archive(string $uuid, int $organizationId, int $userId): PublicationResultDto`
    - Validates transition allowed (`PUBLISHED` -> `ARCHIVED`).
    - `DB::transaction()` updates status to `ARCHIVED`.

- **Audit Generation**: As confirmed in Phase 1, there is no existing Assessment-level audit infrastructure. Per requirements, I will document this gap and will NOT introduce fake audit systems or logging.

### 4. API & Controllers

#### [NEW] `app/Modules/Assessment/Controllers/AssessmentPublicationController.php`
- `makeReady(Request $request, string $uuid)`
- `publish(Request $request, string $uuid)`
- `archive(Request $request, string $uuid)`

#### [NEW] `app/Modules/Assessment/Resources/PublicationResultResource.php`
- Transforms `PublicationResultDto` into JSON response.

#### [MODIFY] `routes/modules/assessment.php`
- Repoint existing routes and add `ready`:
  - `POST assessments/{uuid}/ready` -> `AssessmentPublicationController@makeReady`
  - `POST assessments/{uuid}/publish` -> `AssessmentPublicationController@publish`
  - `POST assessments/{uuid}/archive` -> `AssessmentPublicationController@archive`

### 5. Automated Tests

#### [NEW] `tests/Unit/Modules/Assessment/Services/AssessmentPublicationServiceTest.php`
- Unit tests mocking Repository and ValidationService.
- Covers success paths and ALL denied transitions (e.g. `PUBLISHED` -> `DRAFT`).
- Validates exception error codes.
- Validates transaction logic execution.
- Validates `PublicationStateMachine::isMutable()` outputs.

#### [NEW] `tests/Feature/Modules/Assessment/API/AssessmentPublicationFeatureTest.php`
- E2E testing of the `POST` endpoints.
- Validates tenant isolation ensuring cross-tenant publication fails.

## Verification Plan
- Run `php artisan test --filter AssessmentPublicationServiceTest`
- Run `php artisan test --filter AssessmentPublicationFeatureTest`
