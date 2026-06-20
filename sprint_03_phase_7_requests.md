# Sprint 03 – Phase 7: Requests (Assessment Delivery Engine)

The Form Request Validation Layer for the Assessment Delivery Engine has been successfully generated. This layer serves strictly as the HTTP payload validation and translation boundary before hitting the isolated DTOs.

## Request Inventory & Locations

All 13 Requests have been generated at: `app/Modules/Delivery/Requests/`

### Session Requests
*   `LaunchAssessmentRequest.php`
*   `ResumeSessionRequest.php`
*   `TerminateSessionRequest.php`

### Attempt Requests
*   `SubmitAssessmentRequest.php`
*   `ExpireAttemptRequest.php`

### Question Requests
*   `FlagQuestionRequest.php`
*   `UnflagQuestionRequest.php`
*   `NavigateQuestionRequest.php`

### Answer Requests
*   `CreateAnswerRequest.php`
*   `UpdateAnswerRequest.php`
*   `AutoSaveAnswerRequest.php`

### Audit Requests
*   `GetAttemptEventsRequest.php`
*   `GetAttemptAuditsRequest.php`

## Architectural Rules Enforced

*   **Authorization Bypass:** `authorize()` is hardcoded to return `true` across all requests. All permissions are strictly delegated to the Phase 6 Policies.
*   **UUID Strictness:** The requests immediately reject database IDs (`id`, `organization_id`, `assessment_session_id`, etc.). All identifiers are validated through the `['required', 'uuid']` pipe.
*   **Validation Only:** Zero repositories, services, or DB queries are invoked. The requests strictly validate incoming shapes.
*   **Human-Readable Localization:** Both `messages()` and `attributes()` are fully implemented to map backend keys (`attempt_uuid`) to user-friendly nouns ("Attempt").

## The DTO Bridge

A critical architectural bridge has been enforced across all mutating requests. The method `toDto()` has been mapped to hydrate the DTOs created in Phase 4.

**Implementation Example (`SubmitAssessmentRequest`):**
```php
public function toDto(): SubmitAttemptDto
{
    return new SubmitAttemptDto(
        $this->validated('attempt_uuid'),
        $this->validated('confirmation'),
        now()->toDateTimeString()
    );
}
```

Controllers will consume `$request->toDto()` instead of raw `$request->validated()` arrays, guaranteeing immutable transport structures.

## Next Steps

Awaiting your command to proceed to Phase 8 (Resources).
