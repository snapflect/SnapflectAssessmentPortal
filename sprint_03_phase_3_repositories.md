# Sprint 03 – Phase 3: Repositories (Assessment Delivery Engine)

The Repository layer for the Assessment Delivery Engine has been successfully generated in strict adherence to the anemic Repository Pattern. 

## Repository Inventory & Locations

All 12 files (6 Interfaces, 6 Implementations) have been generated in the following directories:
*   `app/Modules/Delivery/Repositories/Interfaces/`
*   `app/Modules/Delivery/Repositories/Eloquent/`

### 1. AssessmentSessionRepository
*   **Interface:** `AssessmentSessionRepositoryInterface.php`
*   **Implementation:** `AssessmentSessionRepository.php`
*   **Methods:** `findById()`, `findByUuid()`, `findByIdWithRelations()`, `findByUuidWithRelations()`, `findWithTrashed()`, `findOnlyTrashed()`, `findBySessionToken()`, `findActiveSessionByCandidate()`, `findExpiredSessions()`, `paginateByOrganization()`, `query()`, `create()`, `update()`

### 2. AssessmentAttemptRepository
*   **Interface:** `AssessmentAttemptRepositoryInterface.php`
*   **Implementation:** `AssessmentAttemptRepository.php`
*   **Methods:** `findById()`, `findByUuid()`, `findByIdWithRelations()`, `findByUuidWithRelations()`, `findWithTrashed()`, `findOnlyTrashed()`, `findActiveAttempt()`, `findSubmittedAttempt()`, `findExpiredAttempts()`, `findBySnapshot()`, `paginateByOrganization()`, `query()`, `create()`, `update()`

### 3. AttemptQuestionRepository
*   **Interface:** `AttemptQuestionRepositoryInterface.php`
*   **Implementation:** `AttemptQuestionRepository.php`
*   **Methods:** `findById()`, `findByUuid()`, `findByIdWithRelations()`, `findByUuidWithRelations()`, `findWithTrashed()`, `findOnlyTrashed()`, `findByAttempt()`, `findBySection()`, `paginateByAttempt()`, `query()`, `create()`, `update()`

### 4. CandidateAnswerRepository
*   **Interface:** `CandidateAnswerRepositoryInterface.php`
*   **Implementation:** `CandidateAnswerRepository.php`
*   **Methods:** `findById()`, `findByUuid()`, `findByIdWithRelations()`, `findByUuidWithRelations()`, `findWithTrashed()`, `findOnlyTrashed()`, `findByAttempt()`, `findByQuestion()`, `findLatestAnswer()`, `create()`, `update()`, `query()`

### 5. AttemptEventRepository
*   **Interface:** `AttemptEventRepositoryInterface.php`
*   **Implementation:** `AttemptEventRepository.php`
*   **Methods:** `createEvent()`, `getAttemptTimeline()`, `getEventsByType()`, `query()`
*   *Note: Immutable compliance table. Soft delete and standard update methods purposefully omitted.*

### 6. AttemptSubmissionRepository
*   **Interface:** `AttemptSubmissionRepositoryInterface.php`
*   **Implementation:** `AttemptSubmissionRepository.php`
*   **Methods:** `findById()`, `findByUuid()`, `findByIdWithRelations()`, `findByUuidWithRelations()`, `findByAttempt()`, `create()`, `query()`
*   *Note: Immutable record table. Soft delete and standard update methods purposefully omitted.*

## Architectural Rules Enforced

*   `declare(strict_types=1);` is present on every file.
*   The layer exclusively handles **database access**.
*   Zero business, validation, or authorization logic is present.
*   Zero database transactions were defined (strictly reserved for the Service layer).
*   Eager loading methods (`*WithRelations`) were correctly stubbed for aggregate roots.
*   Soft delete inspection (`findWithTrashed()`, `findOnlyTrashed()`) applies only to the supported mutable models. 

## Next Steps

Awaiting your command to proceed to Phase 4 (DTOs).
