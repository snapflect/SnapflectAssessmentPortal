# 217 Candidate Results Dashboard

**Document Version:** 1.0
**Phase:** Sprint 08 Engineering
**Domain:** Candidate Results Frontend
**Status:** IMPLEMENTED

---

## Executive Summary

Phase 217 delivers the frontend experience for Candidate Results, strictly conforming to the `213_RESULTS_DASHBOARD_RULEBOOK` and `214_RESULTS_OPENAPI_CONTRACT`. The application securely consumes the Sprint 07 scoring output while utilizing an elegant Angular Signals architecture to ensure that missing or restricted data gracefully degrades in the UI without causing errors.

---

## Implemented Components

### 1. `ResultsStore` & `ResultsFacade`
*Location:* `frontend/src/app/modules/results/state/`
- Acts as the pure, single source of truth for the candidate UI.
- Exposes derived Signals (`isScoreVisible`, `isPassFailVisible`, `hasCompetencies`) based directly on whether the API stripped the values to `null`. This moves business logic out of the component templates.
- **Rule 1 Verification:** The Facade implements only `GET` methods. It possesses zero capability to trigger recalculations or mutate data.

### 2. `ResultsApiService`
*Location:* `frontend/src/app/modules/results/services/`
- Strongly typed HTTP client pointing to `/api/v1/candidates/results`.
- Explicitly intercepts `RFC7807` formatted error objects (e.g., `visibility-restricted`, `result-not-published`) and passes them upward to the Store to render user-friendly contextual error banners.

### 3. `CandidateResultsPageComponent`
*Location:* `frontend/src/app/modules/results/pages/`
- The primary landing zone for a completed assessment.
- **Score Display:** Dynamically hides the massive percentage circle if the blueprint disables `score_visibility`, swapping it for a reassuring "Assessment Completed" text block.
- **Pass/Fail Display:** Conditionally renders the green/red outcome block solely if `passFailStatus` is present in the payload.

### 4. `CompetencyBreakdownComponent`
*Location:* `frontend/src/app/modules/results/components/`
- Visualizes sub-domain data.
- If the blueprint `show_competencies` flag is false, the API returns a `403 Forbidden`. The `ResultsFacade` gracefully catches this and resets the array to empty, causing this component to simply vanish from the UI without alerting the user.

### 5. `ResultHistoryPageComponent`
*Location:* `frontend/src/app/modules/results/pages/`
- A master/detail list view presenting a paginated history of all published results for the authenticated candidate.

---

## Architectural Verification

- **Rule 1 (Read Only):** 🟢 Validated. The UI contains zero scoring logic and only consumes pre-calculated outcomes.
- **Rule 2 (Visibility Governance):** 🟢 Validated. By utilizing strict `null` checks on the DTO payloads, the UI can never accidentally leak an inferred score. If the backend strips the data to honor a blueprint, the UI elegantly adapts.
- **Rule 3 (Angular Signal First):** 🟢 Validated. The state is driven entirely by `@angular/core/signal` and `@angular/core/computed` properties, preventing change-detection spaghetti.

---

## Next Recommended Step

The Candidate-facing presentation layer is complete. We should now pivot to the Administrator perspective to deliver the aggregated metrics defined in our Implementation Plan.

**Next Phase:** `218_ADMIN_ANALYTICS_DASHBOARD`
