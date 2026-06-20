# Sprint 03 – Phase 2: Models (Assessment Delivery Engine)

The Eloquent models for the Assessment Delivery Engine have been successfully generated in strict adherence to the anemic modeling pattern required by the architecture.

## Model Inventory & Locations

All 8 models have been generated at: `app/Modules/Delivery/Models/`

*   `AssessmentSession.php`
*   `AssessmentAttempt.php`
*   `AttemptSection.php`
*   `AttemptQuestion.php`
*   `CandidateAnswer.php`
*   `AttemptEvent.php`
*   `AttemptAudit.php`
*   `AttemptSubmission.php`

## Traits Applied

*   **`HasUuid`**: Applied to all models.
*   **`BelongsToOrganization`**: Applied to all models.
*   **`HasAuditFields`**: Applied to mutable tracking tables (`AssessmentSession`, `AssessmentAttempt`, `AttemptSection`, `AttemptQuestion`, `CandidateAnswer`). Intentionally omitted from immutable ledger tables (`AttemptEvent`, `AttemptAudit`, `AttemptSubmission`).

## Relationships Matrix

| Model | Belongs To | Has Many | Has One |
| :--- | :--- | :--- | :--- |
| **AssessmentSession** | Organization, Assessment, Version, Snapshot, Candidate | - | AssessmentAttempt |
| **AssessmentAttempt** | Session, Organization, Assessment, Version, Snapshot, Candidate | AttemptSections, AttemptQuestions, CandidateAnswers, AttemptEvents, AttemptAudits | AttemptSubmission |
| **AttemptSection** | Organization, AssessmentAttempt | AttemptQuestions | - |
| **AttemptQuestion** | Organization, AssessmentAttempt, AttemptSection | CandidateAnswers | - |
| **CandidateAnswer** | Organization, AssessmentAttempt, AttemptQuestion | - | - |
| **AttemptEvent** | Organization, AssessmentAttempt | - | - |
| **AttemptAudit** | Organization, AssessmentAttempt | - | - |
| **AttemptSubmission** | Organization, AssessmentAttempt, Snapshot, Candidate | - | - |

## Security & Casting Rules Enforced

*   `declare(strict_types=1);` is present on every file.
*   Internal integer IDs and tracking IDs (`id`, `created_by`, `modified_by`, `deleted_by`) are added to the `$hidden` array on all relevant models.
*   Explicit exception: `organization_id`, `candidate_user_id`, and `assessment_snapshot_id` remain visible for administrative payload tracking as instructed.
*   Zero business, validation, or authorization logic was embedded.

## Full PHP Code Review

Below are links to view the exact PHP code generated for each model:

*   [AssessmentSession.php](file:///D:/Mubarak/SnapFlectMobileWebApp/Snapflect%20Assessment%20Portal/snapflect/app/Modules/Delivery/Models/AssessmentSession.php)
*   [AssessmentAttempt.php](file:///D:/Mubarak/SnapFlectMobileWebApp/Snapflect%20Assessment%20Portal/snapflect/app/Modules/Delivery/Models/AssessmentAttempt.php)
*   [AttemptSection.php](file:///D:/Mubarak/SnapFlectMobileWebApp/Snapflect%20Assessment%20Portal/snapflect/app/Modules/Delivery/Models/AttemptSection.php)
*   [AttemptQuestion.php](file:///D:/Mubarak/SnapFlectMobileWebApp/Snapflect%20Assessment%20Portal/snapflect/app/Modules/Delivery/Models/AttemptQuestion.php)
*   [CandidateAnswer.php](file:///D:/Mubarak/SnapFlectMobileWebApp/Snapflect%20Assessment%20Portal/snapflect/app/Modules/Delivery/Models/CandidateAnswer.php)
*   [AttemptEvent.php](file:///D:/Mubarak/SnapFlectMobileWebApp/Snapflect%20Assessment%20Portal/snapflect/app/Modules/Delivery/Models/AttemptEvent.php)
*   [AttemptAudit.php](file:///D:/Mubarak/SnapFlectMobileWebApp/Snapflect%20Assessment%20Portal/snapflect/app/Modules/Delivery/Models/AttemptAudit.php)
*   [AttemptSubmission.php](file:///D:/Mubarak/SnapFlectMobileWebApp/Snapflect%20Assessment%20Portal/snapflect/app/Modules/Delivery/Models/AttemptSubmission.php)

## Next Steps

Awaiting your command to proceed to Phase 3 (Repositories).
