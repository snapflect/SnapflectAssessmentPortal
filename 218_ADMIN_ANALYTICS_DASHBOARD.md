# 218 Admin Analytics Dashboard

**Document Version:** 1.0
**Phase:** Sprint 08 Engineering
**Domain:** Admin Analytics Frontend
**Status:** IMPLEMENTED

---

## Executive Summary

Phase 218 delivers the frontend experience for Administrator Analytics, strictly conforming to the `213_RESULTS_DASHBOARD_RULEBOOK` and `214_RESULTS_OPENAPI_CONTRACT`. Unlike the Candidate Dashboard, this interface serves aggregate, O(1) materialized data to rapidly visualize cohort trends, competency weaknesses, and flawed questions without querying massive audit logs on the fly.

---

## Implemented Components

### 1. `AnalyticsStore` & `AnalyticsFacade`
*Location:* `frontend/src/app/modules/results/state/`
- Serves as the central nerve center for analytics.
- **Concurrent Fetching:** The Facade uses `forkJoin` to simultaneously pull Assessment, Competency, and Question summaries from the API, resolving them instantly into the Store.
- **Computed KPIs:** The Store utilizes `@computed` Signals to dynamically calculate derivative metrics (e.g., `topCompetency`, `weakestCompetency`, `mostFailedQuestion`) on the client side, keeping the API payloads lean and specific.

### 2. `AnalyticsApiService`
*Location:* `frontend/src/app/modules/results/services/`
- Typed HTTP endpoints explicitly requesting pre-computed materialized views (`/api/v1/admin/analytics/...`).
- **Rule 2 Verification:** This service strictly pulls summarized records. No deep SQL joins or nested JSON parses are triggered.

### 3. `AssessmentSummaryComponent`
*Location:* `frontend/src/app/modules/results/components/analytics/`
- Displays the 6 KPI cards demanded by the Rulebook.
- Extracts its data directly from the derived KPI signals in the `AnalyticsStore`, guaranteeing reactivity.

### 4. `CompetencyHeatmapComponent`
*Location:* `frontend/src/app/modules/results/components/analytics/`
- Visualizes global sub-domain performance (e.g., React vs. CSS).
- Implements a dynamic color-grading function (`getHeatmapColor`) to visually transition bars from red (danger) to green (healthy) based on percentage.

### 5. `QuestionDifficultyComponent`
*Location:* `frontend/src/app/modules/results/components/analytics/`
- Lists assessment questions sorted explicitly by lowest pass rate.
- Serves as the primary operational tool for administrators to identify poorly worded or bugged questions that may require recalculation.

### 6. `AdminAnalyticsPageComponent`
*Location:* `frontend/src/app/modules/results/pages/`
- The master orchestrator view that ties the components together into a unified, responsive Grid layout.

---

## Architectural Verification

- **Rule 1 (Consume Materialized Analytics):** 🟢 Validated. The Angular UI computes zero raw scoring metrics. It solely requests the `summary` API tables.
- **Rule 2 (O(1) Rendering):** 🟢 Validated. Because the metrics are pre-aggregated on publish, the UI scales instantly to cohorts of any size.
- **Rule 3 (Signal-Based State):** 🟢 Validated. Full integration with the `@angular/core/signal` system.
- **Rule 4 & 5 (KPIs & Heatmap):** 🟢 Validated. Designed explicitly to surface the operational insights requested by the Readiness Review.

---

## Next Recommended Step

With both Candidate and Admin standard dashboards complete, Sprint 08 can now progress into the gamification and credentialing phases.

**Next Phase:** `219_LEADERBOARDS_ENGINE`
