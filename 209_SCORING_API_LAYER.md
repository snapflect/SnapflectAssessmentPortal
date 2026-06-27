# 209 Scoring API Layer Implementation

**Document Version:** 1.0
**Phase:** Sprint 07 Phase 8
**Domain:** Assessment Scoring API
**Status:** IMPLEMENTED

---

## Executive Summary

Phase 8 completes the programmatic surface of the Scoring Engine by exposing the transactionally isolated backend logic via the API structure defined in `202_SCORING_OPENAPI_CONTRACT`. This layer acts exclusively as a thin proxy: validating access, handling idempotency, resolving the tenant context, mapping the resulting database models to public DTOs, and applying standard `RFC7807` error handling.

---

## Implemented Components

### 1. `ResultResource`, `CompetencyResource`, and `AuditResource`
*Paths:* `app/Modules/Results/Resources/`
- Strict HTTP Response transformers matching the OpenAPI contract.
- Standardizes percentages, UUID references, boolean pass/fail checks, and Iso8601 timestamps.
- **AuditResource** safely decodes the `new_value_json` payload, mapping it cleanly to the OpenAPI `questionLedger` schema.

### 2. `ScoringController`
*Path:* `app/Modules/Results/Controllers/ScoringController.php`
- Contains the endpoints bridging REST to the `ScoringOrchestratorService`.
- **`POST /score`**: Implements the idempotent trigger rule. Before delegating to the Orchestrator, the controller queries for an existing `READY` result for that attempt. If found, it safely returns the existing data without incurring recalculation costs.
- **`POST /recalculate`**: Admin-only action (auth gates to be enforced via middleware). This explicitly passes a `$forceRecalculate` flag to the orchestrator, overriding the strict `SUBMITTED` state check to calculate Version N+1.
- Provides unified `RFC7807` structured problem responses to the frontend (e.g., `attempt-not-found`, `scoring-in-progress`).

### 3. Service Layer Modifications
*Path:* `app/Modules/Results/Services/ScoringOrchestratorService.php`
- Slightly modified the `executeScoringPipeline()` signature to accept `bool $forceRecalculate`.
- This ensures the Orchestrator can be safely called from the recalculation API endpoint without being blocked by the standard `SUBMITTED` state-gate.

---

## Architectural Verification

- **Rule 1 (Thin Layer):** 🟢 Validated. The Controller contains zero scoring logic, delegating entirely to the Orchestrator.
- **Rule 4 (RFC7807):** 🟢 Validated. Exceptions are caught and transformed into properly formatted Problem Details responses.
- **Rule 5 (Idempotency):** 🟢 Validated. `triggerScoring` halts execution early if a finalized `assessment_result` already exists.
- **Rule 6 (Recalculation):** 🟢 Validated. `recalculateScore` bypasses idempotency while the underlying persistence engine automatically handles incrementing the version rather than overwriting.

---

## Sprint 07 Status

With the API Layer implemented, the core engineering tasks for the Scoring Engine are complete. The pipeline receives candidate submissions, mathematically calculates outcomes across single/multiple choices, scales those values against competency maps, validates them against strict threshold conditions, writes reproducible audit trails to a locked database transaction, and exposes the data reliably through a standardized REST interface.

**Recommended Next Step:**
Commence Phase 9 — `210_INTEGRATION_TESTING` and `211_UAT_VALIDATION`
