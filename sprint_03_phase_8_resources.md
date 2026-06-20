# Sprint 03 – Phase 8: Resources (Assessment Delivery Engine)

The API Resource Layer for the Assessment Delivery Engine has been successfully generated. This layer enforces the strict JSON structure required for front-end rendering while ensuring absolute safety against accidental N+1 database queries.

## Resource Inventory & Locations

All 8 API Resources have been generated at: `app/Modules/Delivery/Resources/`

*   `AssessmentSessionResource.php`
*   `AssessmentAttemptResource.php`
*   `AttemptSectionResource.php`
*   `AttemptQuestionResource.php`
*   `CandidateAnswerResource.php`
*   `AttemptEventResource.php`
*   `AttemptAuditResource.php`
*   `AttemptSubmissionResource.php`

## Architectural Rules Enforced

*   **Strict Types:** `declare(strict_types=1);` is fully applied.
*   **JSON Standard Conformity:** Every response rigidly adheres to the requested schema block: `id`, `uuid`, `attributes`, `relationships`, `timestamps`. 
*   **Internal ID Masking:** Internal DB identifiers (`$this->id`) are never exposed. The standard `id` field maps strictly to `$this->uuid` as a public identifier for frontend clients.
*   **Lazy Loading Safety:** `$this->whenLoaded()` is utilized on every single relationship mapping, preventing the Serialization layer from accidentally triggering un-eager-loaded database queries.
*   **Anemic Structure:** Zero queries, logic, or validation handlers are present within these serializers.

## Special Privacy Logic Handled

### Attempt Events
The `ip_address` and `user_agent` fields are strictly gated using `$this->when()` inside `AttemptEventResource`. These fields will only be attached to the JSON output if the authenticated user making the request has the `ORGANIZATION_ADMIN` or `PLATFORM_ADMIN` role. Candidates cannot see environment extraction data in the payload.

## Next Steps

Awaiting your command to proceed to Phase 9 (Controllers).
