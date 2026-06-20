# Sprint 04 – Phase 2: Models (Scoring & Results Engine)

The Eloquent Model Layer for the Scoring and Results Engine has been successfully generated in strict adherence to Domain-Driven Design constraints. These models are completely anemic and strictly manage object relational mapping.

## Model Inventory & Locations

All 10 Models have been scaffolded within the new Results Module namespace `app/Modules/Results/Models/`:

1.  `AssessmentResult.php`
2.  `ResultVersion.php`
3.  `QuestionScore.php`
4.  `SectionScore.php`
5.  `CompetencyScore.php`
6.  `ResultRule.php`
7.  `ResultPublication.php`
8.  `ResultAudit.php`
9.  `ResultSnapshot.php`
10. `ManualScoreReview.php`

## Architectural Rules Enforced

*   **Strict Typing:** `declare(strict_types=1);` is declared at the top of every file.
*   **Anemic Structure:** Zero business logic, validation, state machine rules, or query scopes were placed inside these models. They act solely as configuration blocks.
*   **Trait Application:**
    *   `HasUuid` and `BelongsToOrganization` were uniformly applied to **all** 10 models.
    *   `HasAuditFields` was explicitly **omitted** from the `ResultAudit` and `ResultSnapshot` models to guarantee compliance with the required immutability rules.
*   **Relationship Strictness:** Every relationship mapped strictly uses explicit Laravel 11 return types (e.g., `BelongsTo`, `HasMany`) and hard-references the correct isolated module namespaces (e.g., `\App\Modules\Security\Models\User`).

## Tenant Key Serialization

To comply with Admin API visibility rules, internal identifiers like `organization_id`, `candidate_user_id`, and `assessment_attempt_id` have deliberately **not** been added to the `$hidden` array. These values will be serialized alongside the `uuid` when requested by backend operations.

## Next Steps

Awaiting your command to proceed to Phase 3 (Repositories) or further Sprint 04 execution directives.
