# Sprint 03 – Phase 4: DTOs (Assessment Delivery Engine)

The Data Transfer Object (DTO) layer for the Assessment Delivery Engine has been successfully generated. These objects enforce strict transport contracts between the HTTP Request layer and the internal Service logic.

## DTO Inventory & Locations

All 16 DTO files have been generated at: `app/Modules/Delivery/DTOs/`

### Session DTOs
*   `LaunchAssessmentDto.php`
*   `ResumeSessionDto.php`
*   `TerminateSessionDto.php`

### Attempt DTOs
*   `CreateAttemptDto.php`
*   `UpdateAttemptProgressDto.php`
*   `ExpireAttemptDto.php`
*   `SubmitAttemptDto.php`

### Question DTOs
*   `LoadAttemptQuestionsDto.php`
*   `NavigateQuestionDto.php`
*   `FlagQuestionDto.php`

### Answer DTOs
*   `CreateAnswerDto.php`
*   `UpdateAnswerDto.php`
*   `AutoSaveAnswerDto.php`

### Audit DTOs
*   `CreateAttemptEventDto.php`
*   `CreateAttemptAuditDto.php`

### Submission DTOs
*   `CreateSubmissionDto.php`

## Architectural Rules Enforced

*   **Strict Types:** `declare(strict_types=1);` applied to all files.
*   **Immutability:** Every DTO is defined as a PHP 8.2 `readonly class` to guarantee data cannot be mutated mid-flight.
*   **UUID Strategy:** Absolute prohibition of internal database IDs (`id`, `organization_id`, `assessment_session_id`, etc.). All cross-domain payload routing uses strictly UUID string formats.
*   **Serialization Capabilities:** `toArray()` and `fromArray()` methods map exactly to the declared properties, safely handling nullable and JSON types.
*   **Pure Transport:** Zero validation, business, or Eloquent logic was embedded.

## Special Requirement Implementations

*   **`CreateAnswerDto` & `UpdateAnswerDto`:** Fully implemented multidimensional type support incorporating `selected_option_uuid`, `selected_option_uuids_json`, `text_answer`, `numeric_answer`, and raw `answer_json`.
*   **`AutoSaveAnswerDto`:** Specifically tailored to bypass overhead using only `attempt_uuid`, `question_uuid`, `answer_json`, `saved_at`, and `answer_version`.
*   **`SubmitAttemptDto`:** Built with `attempt_uuid`, `confirmation` boolean lock, and `submitted_at` timestamp.

## Next Steps

Awaiting your command to proceed to Phase 5 (Services).
