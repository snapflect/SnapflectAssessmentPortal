# Sprint 03 – Phase 6: Policies (Assessment Delivery Engine)

The Authorization Policy Layer for the Assessment Delivery Engine has been successfully generated. This layer strictly governs tenant isolation and restricts access based on role mapping and immutable state rules.

## Policy Inventory & Locations

All 5 Authorization Policies have been generated at: `app/Modules/Delivery/Policies/`

*   `AssessmentSessionPolicy.php`
*   `AssessmentAttemptPolicy.php`
*   `AttemptQuestionPolicy.php`
*   `CandidateAnswerPolicy.php`
*   `AttemptSubmissionPolicy.php`

## Architectural Rules Enforced

*   **Strict Types:** `declare(strict_types=1);` is fully applied.
*   **Pure Authorization:** No database querying, repositories, services, or business logic were embedded in the layer.
*   **Boolean Contracts:** All ability methods strictly return a `bool` (or `?bool` in the before override).

## Tenant Isolation & Global Overrides

*   **Global Override:** The `before(User $user)` method is implemented across all policies. If a user holds the `PLATFORM_ADMIN` role, it immediately returns `true`, granting universal access.
*   **Tenant Isolation Rule:** Every method explicitly checks `$user->organization_id !== $entity->organization_id` before evaluating further logic. Any mismatch results in an immediate `false` return to protect multi-tenant integrity.

## Authorization & Role Matrix

| Entity Policy | Action | Candidate | Organization Admin |
| :--- | :--- | :--- | :--- |
| **AssessmentSession** | `view`, `resume` | Allow (Own only) | Allow (View only) |
| | `terminate` | Deny | Allow |
| **AssessmentAttempt** | `view` | Allow (Own only) | Allow |
| | `submit` | Allow (Own only) | Deny |
| | `forceExpire` | Deny | Allow |
| **AttemptQuestion** | `view` | Allow (Own only) | Allow (View only) |
| | `flag`, `unflag` | Allow (Own only) | Deny |
| **CandidateAnswer** | `view` | Allow (Own only) | Allow (View only) |
| | `create`, `update`, `autoSave`| Allow (Own only) | Deny |
| **AttemptSubmission** | `view` | Allow (Own only) | Allow |

## Submission Lock Rule

A critical guard clause has been embedded into mutating policies (`AssessmentAttemptPolicy`, `AttemptQuestionPolicy`, `CandidateAnswerPolicy`).

*   If an attempt's status is `LOCKED`, actions like `submit`, `create` (answer), `update` (answer), `autoSave`, `flag`, and `unflag` instantly return `false`, regardless of the user's role (except Platform Admin). This permanently locks out Candidate manipulation on finalized attempts.

## Next Steps

Awaiting your command to proceed to Phase 7 (Requests).
