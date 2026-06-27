# 206 Competency Scoring Engine Implementation

**Document Version:** 1.0
**Phase:** Sprint 07 Phase 5
**Domain:** Assessment Scoring & Evaluation Engine
**Status:** IMPLEMENTED

---

## Executive Summary

Phase 5 introduces the **Competency Scoring Engine**, which is responsible for aggregating individual question scores into domain-specific sub-scores. Modern assessments are rarely graded on a flat scale; instead, they measure specific skills (e.g., "React", "CSS") that are weighted and evaluated independently.

This engine cleanly consumes the `QuestionScoreDto` array generated in Phase 4 without touching the database or attempting to reverse-engineer the original candidate answers.

---

## Implemented Components

### 1. `CompetencyScoreDto`
*Path:* `app/Modules/Results/DTOs/CompetencyScoreDto.php`
- A strictly typed data transfer object carrying the aggregated domain performance.
- Fields: `competencyUuid`, `competencyName`, `maxScore`, `awardedScore`, `percentage`, `weight`, `passed`, and `questionCount`.
- **Significance:** Encapsulates the complete picture of a candidate's performance in a single domain, ready for persistence or frontend charting (e.g., Radar charts).

### 2. `CompetencyScoringService`
*Path:* `app/Modules/Results/Services/CompetencyScoringService.php`
- The core aggregation engine.
- Consumes the `snapshot_json` blueprint to extract the `competencies` definitions and mapping thresholds.
- Consumes the `QuestionScoreDto[]` array from Phase 4.
- Maps question scores to their tagged competencies (supports many-to-many relationships, e.g., a question mapped to both "React" and "CSS").
- Safely aggregates the maximum possible scores and the awarded scores.
- Floors any negative competency totals to `0.0`.
- Calculates the final percentage utilizing the standardized 2-decimal precision rule (`ROUND(x, 2)`).
- Determines if the candidate passed the specific domain based on the `pass_threshold_percentage` defined in the blueprint.

### 3. `CompetencyScoringServiceTest`
*Path:* `tests/Unit/Modules/Results/Services/CompetencyScoringServiceTest.php`
- Comprehensive unit test coverage validating aggregation and math.
- Validates:
  - Exact calculation of multi-domain questions (awarding points to all mapped competencies simultaneously).
  - Validation of the `passed` boolean per competency against dynamic thresholds.
  - Verification that negative markings accumulated across a domain are safely floored to `0.0` at the percentage boundary.
  - Edge cases, such as assessments with zero competencies defined.

---

## Architectural Verification

- **Rule 1 (Never Recalculate):** 🟢 Validated. The service exclusively consumes `QuestionScoreDto[]`.
- **Rule 2 (Purity):** 🟢 Validated. The service contains no persistence, state changes, or database reads.
- **Rule 3 (Weights):** 🟢 Validated. The `CompetencyScoreDto` extracts and carries the `weight` variable for downstream use.
- **Rule 4 (Thresholds):** 🟢 Validated. The service only determines the `passed` status *per competency*. The final outcome remains untouched.

---

## Next Sequence

With both the raw question scores (Phase 4) and the competency sub-scores (Phase 5) calculated in memory, the pipeline requires an Evaluation Engine to interpret these numbers against the final assessment rules to declare an overall `PASS` or `FAIL`.

**Recommended Next Step:**
Commence Phase 6 — `207_EVALUATION_ENGINE`
