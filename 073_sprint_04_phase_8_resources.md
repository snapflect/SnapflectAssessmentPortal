# Sprint 04 – Phase 8: Resources (Scoring & Results Engine)

The API Resource Layer for the Scoring and Results Engine is fully established. This strictly anemic JSON serialization layer guarantees structured, secure frontend delivery while protecting sensitive database keys and compliance ledgers.

## Resource Inventory & Locations

A total of **8 API Resource Classes** have been deployed into `app/Modules/Results/Resources/`:

1.  `AssessmentResultResource.php`
2.  `QuestionScoreResource.php`
3.  `SectionScoreResource.php`
4.  `CompetencyScoreResource.php`
5.  `ResultPublicationResource.php`
6.  `ManualScoreReviewResource.php`
7.  `ResultAuditResource.php`
8.  `ResultSnapshotResource.php`

## Architectural Rules Enforced

*   **Strict Standard JSON Contract:** Every single resource enforces the exact structural map: `id`, `uuid`, `attributes`, `relationships`, `timestamps`. No top-level attribute bleeding exists.
*   **ID Encapsulation:** The top-level `id` field maps strictly to `$this->uuid`. Internal `BIGINT` tracking IDs are completely absent from the serialized array, ensuring frontend clients and API consumers only communicate via UUIDs.
*   **The whenLoaded() Protection Trap:** Nested relational data (`question_scores`, `section_scores`, `competency_scores`, `publications`) strictly invoke `$this->whenLoaded()`. Lazy loading N+1 database queries via the frontend is structurally impossible.
*   **Immutable Ledger Protection:** 
    *   The `ResultSnapshotResource` expressly ignores `snapshot_json` and `rules_snapshot_json`, securely shielding internal grading rule schemas from API leakages.
    *   The `ResultAuditResource` completely hides the internal audit IDs as required, exposing only `audit_type`, `audit_description`, and `performed_at`.
*   **Dynamic Timestamping:** `$this->whenNotNull()` guarantees that timestamps like `deleted_date` only occupy payload bandwidth when genuinely present (e.g., when a soft deletion has actively occurred).

## Next Steps

Awaiting your command to proceed to Phase 9 (Controllers) or further Sprint 04 execution directives.
