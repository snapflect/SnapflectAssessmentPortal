# Sprint 03 – Phase 5: Services (Assessment Delivery Engine)

The Service Layer for the Assessment Delivery Engine has been successfully established. This layer exclusively owns the business logic, state machine transitions, event auditing, and transaction boundaries.

## Domain Exceptions Generated

The following custom exceptions were generated in `app/Modules/Delivery/Exceptions/` to handle complex runtime constraints:
*   `AssessmentSessionException.php`
*   `AttemptStateException.php`
*   `AttemptSubmissionException.php`
*   `TimerExpiredException.php`
*   `UnauthorizedAttemptAccessException.php`

## Service Inventory & Responsibilities

All services reside in `app/Modules/Delivery/Services/`. Every mutating method is rigorously secured inside a `DB::transaction()` to ensure atomicity.

### 1. AssessmentSessionService
*   **Responsibilities:** `launchAssessment()`, `resumeSession()`, `terminateSession()`, `expireSession()`, `validateCandidateAccess()`
*   **Rules Enforced:** Validates snapshot delivery constraints and enforces the "one active attempt per candidate" rule. Issues `SESSION_STARTED` and `SESSION_RESUMED` events.

### 2. AssessmentAttemptService
*   **Responsibilities:** `createAttempt()`, `updateProgress()`, `lockAttempt()`, `expireAttempt()`, `abandonAttempt()`
*   **Rules Enforced:** Acts as the strict State Machine for the Attempt lifecycle (`NOT_STARTED` -> `IN_PROGRESS` -> `SUBMITTED` | `EXPIRED` | `ABANDONED` -> `LOCKED`).

### 3. AttemptQuestionService
*   **Responsibilities:** `loadQuestions()`, `loadQuestion()`, `nextQuestion()`, `previousQuestion()`, `jumpToQuestion()`
*   **Rules Enforced:** Guarantees candidates only consume Snapshot questions, completely isolating the live assessment blueprint.

### 4. CandidateAnswerService
*   **Responsibilities:** `createAnswer()`, `updateAnswer()`, `autoSaveAnswer()`, `flagQuestion()`, `unflagQuestion()`
*   **Rules Enforced:** Implements auto-save transaction wrappers, increments `answer_version` tracking, and generates `ANSWER_SAVED` and `ANSWER_UPDATED` events via the Audit Service.

### 5. AttemptTimerService
*   **Responsibilities:** `getRemainingSeconds()`, `validateExpiration()`, `expireAttemptIfRequired()`, `calculateServerTime()`
*   **Rules Enforced:** Sever-authoritative timing. Automatically throws `TimerExpiredException` if the browser attempts to submit after the backend expiration threshold.

### 6. AttemptSubmissionService
*   **Responsibilities:** `submitAssessment()`, `createSubmission()`, `lockAnswers()`, `finalizeAttempt()`
*   **Rules Enforced:** Drives the one-way transition to `SUBMITTED`. Deeply locks answers against future edits and delegates submission log creation to the Audit Service.

### 7. AttemptAuditService
*   **Responsibilities:** `createEvent()`, `createAudit()`, `recordAnswerChange()`, `recordSubmission()`, `recordSessionAction()`
*   **Rules Enforced:** The central aggregator for the immutable compliance ledger. Manages the injection of the 10 Mandatory Events (`SESSION_STARTED`, `ANSWER_SAVED`, etc.) directly into the event stream.

## Architectural Integrity

*   **Strict Types:** `declare(strict_types=1);` is fully applied.
*   **Encapsulation:** The Service layer is 100% decoupled from the HTTP/Controller layer.
*   **Transactions:** `DB::transaction()` completely wraps all write/update methods.

## Next Steps

Awaiting your command to proceed to Phase 6 (Policies) or subsequent steps.
