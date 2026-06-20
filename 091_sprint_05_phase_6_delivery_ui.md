# Sprint 05 – Phase 6: Delivery UI

The Delivery UI feature module has been successfully integrated into the Angular architecture. This module strictly handles the candidate-facing execution interface, prioritizing performance, state retention, and strict boundary mapping without touching any evaluation or scoring calculations.

## Delivery Module Inventory (`src/app/features/delivery/`)

### Pages Scaffolded
*   `CandidateDashboardPageComponent`: Landing boundary for candidate session discovery.
*   `SessionListPageComponent` & `SessionDetailPageComponent`
*   `AttemptStartPageComponent`: Pre-flight check UI before locking a candidate into an attempt.
*   `AttemptQuestionPageComponent`: The core execution boundary mapping to `/delivery/attempts/:uuid`.
*   `AttemptSummaryPageComponent`: Pre-submission review screen.
*   `AttemptSubmissionPageComponent`: Post-submission status screen.

### UI Components Scaffolded
*   `QuestionNavigatorComponent`: Grid or list UI for jumping between answered/unanswered questions.
*   `AttemptTimerComponent`: Visual countdown timer mapping the server's authoritative expiration.
*   `ProgressTrackerComponent`: Visual percentage bar of completion.
*   `AnswerPanelComponent`: Interactive wrapper for candidate selections.
*   `QuestionRendererComponent`: Factory component prepped to render Single Choice, Multiple Choice, True False, Text, and Numeric answer types.
*   `QuestionHeaderComponent`, `SessionCardComponent`, `AttemptSummaryComponent`, `SubmissionConfirmationDialogComponent`.

### Timer & AutoSave Strategy
*   **Attempt Timer:** Display-only countdown relying on the `expires_at` timestamp from the server. Pre-configured visually to trigger **Warning State** (10 minutes) and **Critical State** (5 minutes) CSS classes.
*   **AutoSave:** The `AnswerPanelComponent` will emit changes to the `DeliveryFacade`, which triggers `saveAnswer()` in the background via the ApiService. The Facade tracks the status (`Saving...`, `Saved`) without blocking the candidate's UI progression.

### API Integration
*   `DeliveryApiService`: Fully mapped to the Sprint 03 API schemas, establishing endpoints for `/delivery/sessions`, `/delivery/attempts`, and `/delivery/attempts/:uuid/answers`.

### Facade & State Management
*   **Signal Stores:** Generated `DeliveryStore`, `AttemptStore`, and `SessionStore`. Also generated a targeted `DeliveryQuestionStore` to safely track local candidate progression without polluting the administrative question schemas.
*   **DeliveryFacade:** Coordinates the candidate lifecycle (`startAttempt`, `saveAnswer`, `submitAttempt`) while guaranteeing components never touch the `HttpClient`.

### Routing Map (`delivery.routes.ts`)
*   `/delivery/dashboard`
*   `/delivery/sessions`
*   `/delivery/attempts`
*   `/delivery/attempts/:uuid`
*   `/delivery/attempts/:uuid/summary`
*   `/delivery/attempts/:uuid/submission`

## Architectural Compliance
*   **Zero Evaluation Logic:** The frontend strictly treats questions as JSON configurations and answers as unverified string payloads. It does not calculate points, evaluate correctness, or grade thresholds. It merely passes payloads back to the Delivery engine.
*   **Candidate Segregation:** These routes are intended exclusively for the Candidate Layout pipeline and will be protected by functional routing guards.

## Next Steps
Awaiting your command to proceed to Phase 7 or further Sprint 05 execution directives.
