# Sprint 04 – Phase 6: Policies (Scoring & Results Engine)

The Authorization Policy Layer for the Scoring and Results Engine has been successfully established. This layer exclusively enforces boolean perimeter checks, structurally detaching authorization constraints from the Service and Controller layers.

## Policy Inventory & Locations

A total of **3 Policy Classes** have been scaffolded into `app/Modules/Results/Policies/`:

1.  `AssessmentResultPolicy.php`
2.  `ResultPublicationPolicy.php`
3.  `ManualScoreReviewPolicy.php`

## Architectural Rules Enforced

*   **Boolean Exclusivity:** Every method explicitly returns a `bool` (or `?bool` for the `before()` override). No exceptions are thrown, and no Services or Repositories are injected.
*   **Platform Admin Override:** The `before(User $user)` method in every policy intercepts checks to instantly return `true` if the user posesses the `PLATFORM_ADMIN` role.
*   **Absolute Tenant Perimeter:** The very first condition checked (after Platform Admin override) in every targeted method is `$user->organization_id === $entity->organization_id`. Any cross-tenant bleed instantly returns `false`.
*   **Immutability Protection:** Operations mapping to writes (`calculate()`, `recalculate()`, `publish()`, `create()`, `update()`) proactively check the related `AssessmentResult` status. If the status is `PUBLISHED` or `ARCHIVED`, the policies aggressively return `false`, rejecting any mutation regardless of the user's role (enforcing ledger integrity at the auth gate).
*   **Granular Candidate Isolation:** 
    *   Candidates attempting to `view()` an `AssessmentResult` are strictly gated by `if ($user->id === $result->candidate_user_id)`.
    *   Candidates attempting to view a `ManualScoreReview` are allowed read-only access strictly if the nested `$review->assessmentResult->candidate_user_id` matches their user ID. 

## Next Steps

Awaiting your command to proceed to Phase 7 (Requests) or further Sprint 04 execution directives.
