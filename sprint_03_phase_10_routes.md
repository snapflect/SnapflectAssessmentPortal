# Sprint 03 – Phase 10: Routes (Assessment Delivery Engine)

The REST API Routing Layer for the Assessment Delivery Engine has been successfully established and wired into the core API entry point.

## Module Registration

*   **API Root:** `routes/api.php` has been successfully updated.
*   **Prefix:** `/api/v1/delivery`
*   **Middleware:** The entire module inherits `auth:sanctum` and `throttle:api`.

## Route Inventory & URI Map

The module-specific routes have been exclusively defined in `routes/modules/delivery.php`.

### Session Routes
*   `POST /sessions/launch` → `AssessmentSessionController@launch`
*   `POST /sessions/{session:uuid}/resume` → `AssessmentSessionController@resume`
*   `POST /sessions/{session:uuid}/terminate` → `AssessmentSessionController@terminate`
*   `GET /sessions/{session:uuid}` → `AssessmentSessionController@show`

### Attempt Routes
*   `GET /attempts/{attempt:uuid}` → `AssessmentAttemptController@show`
*   `GET /attempts/{attempt:uuid}/progress` → `AssessmentAttemptController@progress`
*   `POST /attempts/{attempt:uuid}/submit` → `AssessmentAttemptController@submit`
*   `POST /attempts/{attempt:uuid}/expire` → `AssessmentAttemptController@expire`

### Question Routes
*   `GET /attempts/{attempt:uuid}/questions` → `AttemptQuestionController@index`
*   `GET /questions/{question:uuid}` → `AttemptQuestionController@show`
*   `GET /questions/{attempt:uuid}/next` → `AttemptQuestionController@next`
*   `GET /questions/{attempt:uuid}/previous` → `AttemptQuestionController@previous`
*   `GET /attempts/{attempt:uuid}/questions/{question:uuid}` → `AttemptQuestionController@jump`
*   `POST /questions/{question:uuid}/flag` → `AttemptQuestionController@flag`
*   `POST /questions/{question:uuid}/unflag` → `AttemptQuestionController@unflag`

### Answer Routes
*   `POST /answers` → `CandidateAnswerController@store`
*   `PUT /answers/{answer:uuid}` → `CandidateAnswerController@update`
*   `POST /answers/auto-save` → `CandidateAnswerController@autoSave`
*   `GET /answers/{answer:uuid}` → `CandidateAnswerController@show`

### Submission Routes
*   `GET /submissions/{submission:uuid}` → `AttemptSubmissionController@show`
*   `GET /attempts/{attempt:uuid}/events` → `AttemptSubmissionController@events`
*   `GET /attempts/{attempt:uuid}/audits` → `AttemptSubmissionController@audits`

## Architectural Rules Enforced

*   **UUID Strategy:** Absolute exclusion of numerical Database IDs. Route parameters explicitly bind to UUID columns (e.g., `{attempt:uuid}`, `{session:uuid}`) directly triggering Laravel's Route Model Binding engine to resolve the Entity or return a 404 without manually querying repositories.
*   **Thin Layer:** Zero closures, validation, or business logic exist in the routes file. Controllers own the absolute HTTP termination point.

## Next Steps

Awaiting your instructions to proceed to the next Phase (likely Testing).
