# Sprint 06 Phase 1: Assessment Validation Engine Implementation Plan

This plan outlines the real business logic implementation for validating an assessment's readiness. It strictly adheres to the provided requirements without generating placeholders or scaffolding.

## User Review Required

Please review the failure strategy and rule definitions. Specifically:
- **RULE-AV-004 (Correct Answer)**: Does this apply to all question types (e.g., Essay, Fill in the Blanks), or should it only be validated for Multiple Choice? 
- **RULE-AV-009 (Validate Before Publication)**: As instructed, I am NOT implementing the Publication Engine. For this rule, I will implement a validation check that verifies if the assessment's state is valid, which can be hooked into the future publication flow.

> [!IMPORTANT]
> The validation engine will collect ALL failures and return a comprehensive `ValidationResultDto` rather than halting on the first exception.

## Proposed Changes

### 1. Data Transfer Objects (DTOs) & Exceptions
Create the required DTO structures to standardize validation reporting.

#### [NEW] `app/Modules/Assessment/DTOs/ValidationErrorDto.php`
- Fields: `string $ruleCode`, `string $message`, `array $context`

#### [NEW] `app/Modules/Assessment/DTOs/ValidationResultDto.php`
- Fields: `string $assessmentUuid`, `bool $isValid`, `array $errors` (of ValidationErrorDto), `string $timestamp`

#### [NEW] `app/Modules/Assessment/Exceptions/AssessmentValidationException.php`
- Custom exception for critical validation process failures (if any).

---

### 2. Validation Service Engine
The core business logic implementing the 9 validation rules.

#### [NEW] `app/Modules/Assessment/Services/AssessmentValidationService.php`
- **Dependency**: `AssessmentRepositoryInterface`
- **Method `validate(string $assessmentUuid): ValidationResultDto`**:
  - Load Assessment with relations: `blueprint.sections.sectionQuestions.question.options`, `blueprint.sections.sectionQuestions.question.competencies`.
  - **Rule Evaluators**:
    - `RULE-AV-001`: Assert `assessment_name` is present.
    - `RULE-AV-002`: Assert `estimated_duration_minutes > 0`.
    - `RULE-AV-003`: Assert `blueprint->sections` is not empty.
    - `RULE-AV-004`: Loop through questions, assert `options->where('is_correct', true)` is not empty.
    - `RULE-AV-005`: Loop through questions, assert `competencies` relation is not empty.
    - `RULE-AV-006`: Assert `blueprint->sections->sum('section_weight') == 100`.
    - `RULE-AV-007`: Loop through sections, assert `sectionQuestions` is not empty.
    - `RULE-AV-008`: Extract all `question_id`s, assert no duplicates.
    - `RULE-AV-009`: Validate `status` (or general readiness flag).
  - **Audit Generation**: Log `ASSESSMENT_VALIDATED` or `ASSESSMENT_VALIDATION_FAILED` manually (since `AssessmentAudit` doesn't exist, we will use a dedicated audit logger or basic Laravel logs if the specific table hasn't been defined yet).
  - **Persistence**: Store the validation report.

---

### 3. API & Controllers
Expose the validation engine via OpenAPI-compliant endpoints.

#### [NEW] `app/Modules/Assessment/Controllers/AssessmentValidationController.php`
- `validate(string $uuid)`: Triggers the validation and returns the result.
- `getReport(string $uuid)`: Retrieves the last generated validation report.

#### [NEW] `app/Modules/Assessment/Resources/ValidationResultResource.php`
- Transforms `ValidationResultDto` into JSON response.

#### [MODIFY] `routes/modules/assessment.php`
- **Add**: `POST /assessments/{uuid}/validate`
- **Add**: `GET /assessments/{uuid}/validation-report`

---

### 4. Automated Tests
Comprehensive testing of the engine covering success paths, multi-error scenarios, and isolation.

#### [NEW] `tests/Unit/Modules/Assessment/Services/AssessmentValidationServiceTest.php`
- Mock repositories and test the 9 individual rules.
- Test the multi-error collection path.

#### [NEW] `tests/Feature/Modules/Assessment/API/AssessmentValidationFeatureTest.php`
- E2E testing of the `POST` and `GET` endpoints.
- Validates tenant isolation and HTTP response structures.

## Verification Plan

### Automated Tests
- Run `php artisan test --filter AssessmentValidationServiceTest`
- Run `php artisan test --filter AssessmentValidationFeatureTest`

### Manual Verification
- Deploy to local/Hostinger and execute the validation API via Postman or cURL against an assessment with intentionally bad data to verify the multi-error array response.
