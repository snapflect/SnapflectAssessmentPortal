# Sprint 03 – Phase 9: Controllers (Assessment Delivery Engine)

The final HTTP endpoint routing layer for the Assessment Delivery Engine has been successfully generated. These Controllers act purely as orchestration hubs mapping Requests to Services.

## Controller Inventory & Locations

All 5 Controllers have been generated at: `app/Modules/Delivery/Controllers/`

### 1. AssessmentSessionController
*   `launch()` -> Maps `LaunchAssessmentRequest` to `$sessionService->launchAssessment()`
*   `resume()` -> Maps `ResumeSessionRequest` to `$sessionService->resumeSession()`
*   `terminate()` -> Maps `TerminateSessionRequest` to `$sessionService->terminateSession()`
*   `show()` -> Returns `AssessmentSessionResource`

### 2. AssessmentAttemptController
*   `show()` -> Returns `AssessmentAttemptResource`
*   `progress()` -> Returns active `AssessmentAttemptResource` for polling
*   `submit()` -> Maps `SubmitAssessmentRequest` to `$submissionService->submitAssessment()`
*   `expire()` -> Maps `ExpireAttemptRequest` to `$attemptService->expireAttempt()`

### 3. AttemptQuestionController
*   `index()` -> Triggers `$questionService->loadQuestions()`
*   `show()` -> Returns `AttemptQuestionResource`
*   `next()`, `previous()`, `jump()` -> Map `NavigateQuestionRequest` to corresponding `$questionService` methods.
*   `flag()`, `unflag()` -> Map flag requests to `$answerService` operations.

### 4. CandidateAnswerController
*   `store()`, `update()`, `autoSave()` -> Pass DTOs to `$answerService`.
*   `show()` -> Returns `CandidateAnswerResource`.

### 5. AttemptSubmissionController
*   `show()` -> Returns `AttemptSubmissionResource`.
*   `events()`, `audits()` -> Returns immutable Collections mapping to `AttemptEventResource` and `AttemptAuditResource`.

## Architectural Pipeline Enforced

The complete endpoint pipeline has been executed cleanly without violations:
`Controller → Policy → DTO → Service → Resource → JSON`

1.  **Authorization Overlap Removed:** Every controller method aggressively invokes `$this->authorize()` against the loaded Eloquent Model (e.g., `$this->authorize('submit', $attempt)`). We never trust candidate-provided `user_id` payload data.
2.  **DTO Rule:** Controllers strictly pass data to Services via `$request->toDto()`. They never access `$request->all()` or `$request->validated()` natively.
3.  **Strictly Anemic:** Zero business logic, validation, repositories, transactions, or exception handlers live in these files.
4.  **JSON Standard Format:** Every endpoint encapsulates responses in the mandated API standard:
    ```json
    {
      "success": true,
      "message": "...",
      "data": {}
    }
    ```

## Next Steps

Awaiting your command to proceed to Phase 10 (Routes).
