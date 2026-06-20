# Sprint 04 – Phase 5: Services & Exceptions (Scoring & Results Engine)

The core Service Layer and its associated Domain Exceptions have been engineered for the Scoring and Results Engine. This layer acts as the absolute orchestrator of business logic, state machines, and compliance versioning.

## Service Inventory & Locations

A total of **11 Files** (6 Services, 5 Exceptions) have been scaffolded into the Results Module:

### Services (`app/Modules/Results/Services/`)
*   `ScoringService.php`: Drives granular calculation logic for questions and sections.
*   `CompetencyEvaluationService.php`: Manages aggregate skill pass/fail thresholds.
*   `ResultService.php`: Orchestrates the `calculate()` and `recalculate()` flows, forcing structural immutability through snapshotting and versioning.
*   `PublicationService.php`: Enforces the publication state machine (`READY` -> `PUBLISHED` -> `ARCHIVED`).
*   `ManualReviewService.php`: Manages score overrides while guaranteeing historical record preservation.
*   `ReportingService.php`: An exclusively read-only service for extracting analytical data arrays.

### Exceptions (`app/Modules/Results/Exceptions/`)
*   `ResultStateException.php`
*   `ResultPublicationException.php`
*   `ScoringException.php`
*   `CompetencyEvaluationException.php`
*   `ManualReviewException.php`

## Architectural Rules Enforced

*   **Explicit Parameters:** `auth()` and `$request` dependencies are entirely eradicated from this layer. Every service method explicitly accepts `$organizationId` and `$userId` integers as required parameters, guaranteeing deep tenant safety isolated from web middleware.
*   **Transaction Enforcement:** `DB::transaction()` has been strictly injected into all mutating workflows (`calculate`, `recalculate`, `publish`, `archive`, `createReview`, `updateReview`). The `ReportingService` was deliberately excluded from this requirement.
*   **Result Versioning Rule:** In `ResultService@recalculate` and `ManualReviewService@updateReview`, the workflow enforces the creation of a new `ResultVersion` rather than mutating existing score structures.
*   **Audit Integration:** Foundational ledger traps have been planted via `$this->createAudit()` mapping the exact action taxonomy requested (`RESULT_CREATED`, `RESULT_UPDATED`, `RESULT_PUBLISHED`, `RESULT_ARCHIVED`, `MANUAL_OVERRIDE`).
*   **State Machine Protection:** The `PublicationService` actively shields against illegal transitions. Reversing a `PUBLISHED` result back to `READY` immediately throws a `ResultPublicationException`.

## Next Steps

Awaiting your command to proceed to Phase 6 (Policies) or further Sprint 04 execution directives.
