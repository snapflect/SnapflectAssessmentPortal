# Sprint 04 – Phase 7: Form Requests (Scoring & Results Engine)

The Form Request Validation Layer for the Scoring and Results Engine is fully assembled. This layer operates exclusively to sanitize incoming payloads and safely marshal them into the immutable Data Transfer Objects generated in Phase 4.

## Request Inventory & Locations

A total of **6 Form Request Classes** have been created inside `app/Modules/Results/Requests/`:

1.  `CalculateResultRequest.php`
2.  `RecalculateResultRequest.php`
3.  `PublishResultRequest.php`
4.  `ArchiveResultRequest.php`
5.  `CreateManualReviewRequest.php`
6.  `UpdateManualReviewRequest.php`

## Architectural Rules Enforced

*   **Authorization Detachment:** Every `authorize()` method is hardcoded to `return true;`. All security boundaries are structurally offloaded to the strict Policy Layer implemented in Phase 6.
*   **The DTO Bridge:** I embedded the mandatory `toDto()` pipeline method in every class. This physically forces Controllers to hydrate an immutable DTO instead of directly parsing weak arrays via `$request->validated()`.
*   **UUID Validation Trap:** Any API payload attempting to inject internal integers (`id`, `organization_id`) will fail. The payloads strictly accept `uuid` strings mapping to definitions like `result_uuid` and `attempt_uuid`.
*   **Human-Readable Interception:** Fully mapped `messages()` and `attributes()` ensure that front-end clients receive explicit, easily digestible API error messaging (e.g., `"The Result identifier must be a valid UUID"` instead of `"The result uuid must be a valid UUID"`).
*   **Partial Updates (PATCH Support):** The `UpdateManualReviewRequest` gracefully accepts nullable constraints (`nullable|in:PENDING,IN_REVIEW,COMPLETED`), safely passing partial data through the DTO's `array_filter` null-stripping logic to prevent accidental data overwrites.

## Next Steps

Awaiting your command to proceed to Phase 8 (Resources) or further Sprint 04 execution directives.
