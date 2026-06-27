# 219 Leaderboards Engine

**Document Version:** 1.0
**Phase:** Sprint 08 Engineering
**Domain:** Leaderboards & Gamification
**Status:** IMPLEMENTED

---

## Executive Summary

Phase 219 implements the cohort ranking system. True to the separation of concerns established throughout Sprint 08, the Leaderboard Engine introduces exactly zero new mathematical evaluation logic. It acts purely as a specialized view over the existing `assessment_results` and `assessment_attempts` tables, surfacing the data through a deterministic ranking algorithm and a highly responsive Angular Signals UI.

---

## Implemented Components

### Backend Implementation
*Path:* `app/Modules/Results/`
- **`LeaderboardService`:** Executes the raw SQL sorting logic. 
  - **Rule 1 Verification:** The algorithm strictly enforces ranking by `overall_score DESC` followed by `time_taken_seconds ASC`.
  - **Rule 2 Verification:** The service inherently respects `privacy_opt_out`. If a candidate has opted out of public rankings, the mapping layer rewrites their display name to `"Anonymous Candidate"` *before* it ever leaves the server via `LeaderboardEntryDto`.
  - **Rule 3 Verification:** Appends the `rankSnapshotDate` to every DTO payload, ensuring future analytics sprints have a verifiable timestamp for historical comparisons.

### Frontend Implementation
*Path:* `frontend/src/app/modules/results/`
- **`LeaderboardStore` & `LeaderboardFacade`:** Maintains the established Angular architecture pattern. If the backend returns a `403 Forbidden` because `leaderboard_enabled = false` on the blueprint, the Facade catches it gracefully and forces the UI into an elegant fallback state.
- **`LeaderboardTableComponent`:** Visualizes the ranking. Specifically highlights the top 3 spots with medal emojis and draws a distinct UI boundary around the `isCurrentUser` row to ensure candidates can instantly locate their standing.
- **`LeaderboardPageComponent`:** The orchestrating container. If the current user has passed the assessment, a specialized summary widget breaks out of the table to proudly display their exact placement (e.g., "You placed #4 out of 105 passing candidates").

---

## Architectural Verification

- **Rule 4 (Read-Only Consumption):** 🟢 Validated. The `LeaderboardService` relies exclusively on `JOIN` operations across finalized `PUBLISHED` states. It never touches `AutoScoringService` or `EvaluationService`.
- **Rule 5 (Angular Architecture):** 🟢 Validated. The UI remains stateless outside of the specialized `LeaderboardStore`, making component testing trivial.
- **Performance:** For cohorts <10,000, the database indexing on `overall_score` and `completed_at` easily handles the sort load without materialized tables.

---

## Next Recommended Step

Gamification and analytics are now online. The final major business capability of Sprint 08 is the formal credentialing and verification engine.

**Next Phase:** `220_CERTIFICATE_ENGINE`
