# Sprint 04 – Phase 3: Repositories (Scoring & Results Engine)

The Repository Layer for the Scoring and Results Engine has been fully instantiated. Following strict DDD boundaries, this layer is the absolute, exclusive boundary for executing database queries and returning hydrated Eloquent models.

## Repository Inventory & Locations

A total of **12 Files** (6 Interfaces, 6 Implementations) have been created inside `app/Modules/Results/Repositories/`:

### Interfaces (`Interfaces/`)
*   `AssessmentResultRepositoryInterface.php`
*   `ResultVersionRepositoryInterface.php`
*   `QuestionScoreRepositoryInterface.php`
*   `CompetencyScoreRepositoryInterface.php`
*   `ResultPublicationRepositoryInterface.php`
*   `ManualScoreReviewRepositoryInterface.php`

### Implementations (`Eloquent/`)
*   `AssessmentResultRepository.php`
*   `ResultVersionRepository.php`
*   `QuestionScoreRepository.php`
*   `CompetencyScoreRepository.php`
*   `ResultPublicationRepository.php`
*   `ManualScoreReviewRepository.php`

## Architectural Rules Enforced

*   **Strict Typing:** `declare(strict_types=1);` is declared at the top of every interface and implementation file.
*   **Explicit Return Types:** Methods distinctly return native scalars, Eloquent Models, or `Illuminate\Database\Eloquent\Collection` objects.
*   **No Transactions:** As dictated, a class-level PHPdoc block confirms: *"NOTE: Repositories never start transactions. Services own transactions."*
*   **Immutable Entity Rules:** Consistent with Phase 2, `ResultAudit` and `ResultSnapshot` correctly lack any Repository wrappers. They will likely be handled directly by Services or specific immutable event dispatchers since they do not require complex CRUD retrieval or soft-delete access.

## Eager Loading & N+1 Prevention
The mandatory `findByUuidWithRelations(string $uuid)` method has been heavily tuned across all repositories. It preloads all requested nested structures to aggressively prevent N+1 database queries. For instance, `AssessmentResultRepository` seamlessly preloads nested relations like `questionScores`, `sectionScores`, `competencyScores`, `resultRules`, and `manualScoreReviews`.

## Tenant & Soft Delete Scopes
*   The `paginateByOrganization(int $organizationId)` scope is implemented across all classes to strictly isolate data retrieval to single organizational contexts.
*   Mutable models explicitly support `findWithTrashed()` and `findOnlyTrashed()`, interacting natively with the custom `is_deleted` structure enforced during migration.

## Next Steps

Awaiting your command to proceed to Phase 4 (DTOs) or further Sprint 04 execution directives.
