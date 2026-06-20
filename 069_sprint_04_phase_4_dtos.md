# Sprint 04 – Phase 4: DTOs (Scoring & Results Engine)

The Data Transfer Object (DTO) Layer for the Scoring and Results Engine has been fully instantiated. Following strict boundary isolation rules, these DTOs serve as the exclusive immutable payloads crossing from Controllers/Requests into the Service layer.

## DTO Inventory & Locations

A total of **7 DTO Files** have been created inside `app/Modules/Results/DTOs/`:

*   `CalculateResultDto.php`
*   `RecalculateResultDto.php`
*   `PublishResultDto.php`
*   `ArchiveResultDto.php`
*   `CreateManualReviewDto.php`
*   `UpdateManualReviewDto.php`
*   `ResultFilterDto.php` (Supporting DTO for filtering/reporting)

## Architectural Rules Enforced

*   **Immutability:** Every DTO is instantiated as a `readonly class` utilizing PHP 8.2 Constructor Property Promotion. There are zero setters.
*   **Base DTO Pattern:** Each object strictly extends the `App\Shared\DTOs\BaseDto` pattern and explicitly overrides the `fromArray(array $data): static` and `toArray(): array` methods.
*   **UUID Strictness:** Internal database integers (e.g., `id`, `organization_id`, `assessment_id`) have been entirely scrubbed. External object relationships strictly expect `uuid` strings (`attempt_uuid`, `result_uuid`, `question_score_uuid`).

## Null Handling & Partial Updates
To support dynamic HTTP PATCH logic securely, DTOs utilizing optional (`?`) fields (like `UpdateManualReviewDto`) use `array_filter($data, fn($value) => !is_null($value))` within their `toArray()` outputs. This dynamically prevents incoming `null` variables from overwriting existing database fields during partial updates.

## Next Steps

Awaiting your command to proceed to Phase 5 (Services) or further Sprint 04 execution directives.
