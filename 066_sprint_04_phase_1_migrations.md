# Sprint 04 – Phase 1: Migrations (Scoring & Results Engine)

The foundational database schema migrations for the Scoring and Results Engine have been fully scaffolded following the precise specifications set out in `062A_SCORING_SCHEMA.SQL`.

## Migration Inventory

All 10 required tables have been generated with timestamp prefixes `2026_06_20_000401` to `2026_06_20_000410` mapping to Sprint 4 Phase 1, residing in `database/migrations/`:

1.  **`assessment_results`:** The core root record for an Assessment Attempt's final calculated grade.
2.  **`result_versions`:** Version control allowing re-calculation of grades if underlying Question Blueprints are proven faulty.
3.  **`question_scores`:** Granular performance tracking per isolated question interaction.
4.  **`section_scores`:** Calculated grouping grades for section-level reporting.
5.  **`competency_scores`:** Mapped skill-level proficiency calculations against predefined thresholds.
6.  **`result_rules`:** Execution records denoting which global or section-level evaluation rules applied.
7.  **`result_publications`:** Workflow gating for hiding/releasing grades (Draft -> Published -> Archived).
8.  **`result_audits`:** Immutable, append-only logging of critical grade-changing actions.
9.  **`result_snapshots`:** Immutable hash-verified JSON blobs permanently freezing the exact rules and scores.
10. **`manual_score_reviews`:** Workflow table facilitating manual grading overrides by reviewers for essay or hybrid questions.

## Architectural Enforcement

*   **Zero Cascade Guarantee:** Every single `$table->foreign()` declaration uses strictly `->restrictOnDelete()`. Data destruction via cascade is structurally impossible.
*   **Audit Integration:** The standard boilerplate (`status`, `created_date`, `modified_date`, `is_deleted`, etc.) is fully mapped onto all mutable tables.
*   **Immutability Recognition:** The `result_audits` and `result_snapshots` tables intentionally omit soft-delete boolean toggles and modifier tracking to enforce absolute ledger immutability.
*   **Internal IDs:** Primary keys remain internal `BIGINT UNSIGNED AUTO_INCREMENT` (`$table->id()`) but are securely shielded by native `uuid` columns for API transport.

## Next Steps

Awaiting your command to proceed to Phase 2 (Models) or further Sprint 04 execution directives.
