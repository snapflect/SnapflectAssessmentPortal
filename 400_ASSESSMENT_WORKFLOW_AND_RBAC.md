# Assessment Workflow & Role-Based Access Control (RBAC)

This document serves as the single source of truth for the Assessment lifecycle and the specific roles authorized to perform actions at each stage.

## 1. State Machine Lifecycle

The assessment lifecycle follows a strict state machine implemented in `PublicationStateMachine.php`.

The valid states and transitions are:
1. **DRAFT** -> **IN_REVIEW** (Action: `Submit Review`)
2. **IN_REVIEW** -> **APPROVED** (Action: `Approve`)
3. **IN_REVIEW** -> **DRAFT** (Action: `Reject`)
4. **APPROVED** -> **PUBLISHED** (Action: `Publish`)
5. **PUBLISHED** -> **ARCHIVED** (Action: `Archive`)

> Note: All state mutations validate against `PublicationStateMachine::isMutable()`, which ensures that `PUBLISHED` and `ARCHIVED` assessments cannot be directly modified or deleted.

## 2. Role-Based Access Control (RBAC)

The system relies on specific predefined roles from `CustomRbacSeeder.php`. The authorizations are enforced via `AssessmentPolicy.php`.

### Allowed Roles Matrix

| Action | Allowed Roles | Description |
| :--- | :--- | :--- |
| **View Any** | `CLIENT_ADMIN`, `ASSESSMENT_MANAGER`, `CONTENT_CREATOR`, `REVIEWER` | Can see the assessment catalog. |
| **Create** | `CLIENT_ADMIN`, `ASSESSMENT_MANAGER`, `CONTENT_CREATOR` | Can create new draft assessments. |
| **Update** | `CLIENT_ADMIN`, `ASSESSMENT_MANAGER`, `CONTENT_CREATOR` | Can modify structural metadata of mutable assessments. |
| **Delete** | `CLIENT_ADMIN`, `ASSESSMENT_MANAGER` | Can delete non-published assessments. |
| **Submit Review**| `CLIENT_ADMIN`, `ASSESSMENT_MANAGER`, `CONTENT_CREATOR` | Can move a `DRAFT` to `IN_REVIEW`. |
| **Approve** | `CLIENT_ADMIN`, `ASSESSMENT_MANAGER`, `REVIEWER` | Can approve or reject an `IN_REVIEW` assessment. |
| **Publish** | `CLIENT_ADMIN`, `ASSESSMENT_MANAGER` | Can move an `APPROVED` assessment to `PUBLISHED` (live). |
| **Archive** | `CLIENT_ADMIN`, `ASSESSMENT_MANAGER` | Can retire a `PUBLISHED` assessment to `ARCHIVED`. |

> Important: A user must also belong to the exact `organization_id` of the Assessment to perform any of the above actions. Cross-organizational access is strictly denied at the Policy layer.

## 3. UI Component State Mapping

The frontend `assessment-list-page.component.ts` dynamically renders buttons and action menus based on the assessment's `current_state`.

- **Submit Review Button**: Renders only if `current_state === 'DRAFT'`
- **Approve / Reject Buttons**: Render only if `current_state === 'IN_REVIEW'`
- **Publish Button**: Renders only if `current_state === 'APPROVED'`
- **Archive Button**: Renders only if `current_state === 'PUBLISHED'`
- **Clone Button**: Renders if `current_state === 'APPROVED' || 'PUBLISHED'`

## 4. Backend Services & Controllers

The orchestration of these states occurs across specific service classes:
- **AssessmentService**: Handles `submitForReview`, `approveAssessment`, and `rejectAssessment` (all basic metadata updates).
- **AssessmentPublicationService**: Handles `publish` and `archive`. Note that `publish` internally triggers the `AssessmentValidationService` to ensure the blueprint is 100% structurally sound before going live.
- **AssessmentCloneService**: Clones an existing assessment and resets its state back to `DRAFT`.
