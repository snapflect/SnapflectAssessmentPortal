# 215 Results Implementation Plan

**Document Version:** 1.0
**Phase:** Sprint 08 Planning
**Domain:** Results & Reporting Engine

---

## 1. GOAL DESCRIPTION

To define the technical architecture and implementation strategy for the Results & Reporting domain (Sprint 08). This plan details how the APIs defined in `214_RESULTS_OPENAPI_CONTRACT` will be backed by reliable, performant data structures, specifically answering critical scaling questions surrounding Analytics, Leaderboards, and Certificate generation.

> [!IMPORTANT]
> **User Review Required**
> Please review the architectural decisions proposed below, particularly regarding the Analytics caching strategy and Certificate revocation rules.

---

## 2. CANDIDATE RESULTS ARCHITECTURE

**Source of Truth:**
- The definitive source of truth is the **`assessment_results`** table, combined with `question_scores` and `competency_scores`.
- **Versioning:** The active version is determined by the highest `result_version` for a given `assessment_attempt_id` where `result_status = 'PUBLISHED'`.
- **Visibility Checks:** The `CandidateResultService` will fetch the blueprint (`snapshot_json`) to resolve visibility flags (`score_visibility`, `pass_fail_visibility`) before populating the DTO. If restricted, data fields are explicitly set to `null` before DTO serialization.

---

## 3. ANALYTICS ARCHITECTURE

**The Challenge:** Calculating `Pass Rates`, `Competency Trends`, and `Question Difficulty Analysis` on the fly requires scanning thousands of JSON audit logs or deeply nested score records, leading to massive N+1 issues and slow dashboard loads at scale.

**Proposed Solution: Pre-Computed Summaries (Async Materialization)**
- **Event-Driven:** When a result transitions to `PUBLISHED` (or is recalculated), an `AssessmentResultPublished` event is fired.
- **Async Processing:** A background worker consumes this event and updates a flattened `assessment_analytics` table (or Redis cache layer).
- **Structure:**
  - `assessment_analytics_summary`: Stores pre-aggregated `total_attempts`, `pass_rate`, `average_score`.
  - `competency_analytics_summary`: Stores average percentage per `competency_uuid`.
  - `question_analytics_summary`: Stores pass/fail ratios per `question_uuid`.
- **API Flow:** The `GET /admin/analytics/*` endpoints perform simple `O(1)` lookups against these summary tables, guaranteeing instant dashboard loads regardless of cohort size.

---

## 4. LEADERBOARDS ENGINE

**Ranking Algorithm:**
- **Primary Sort:** `overall_score DESC`
- **Tie-Breaker:** `time_taken_seconds ASC` (Derived by `completed_at - started_at` from the `assessment_attempts` table).
- **Secondary Tie-Breaker:** `completed_at ASC` (First candidate to achieve the score/time wins).

**Data Retrieval Strategy:**
- For smaller cohorts (<10,000 attempts), standard `ORDER BY` with database indexing on `overall_score` is sufficient.
- The query will strictly filter for `pass_fail_status = PASS` and `status = PUBLISHED`.

**Privacy Masking:**
- If a candidate's `privacy_opt_out` flag is true, the SQL mapping layer overrides their name to `"Anonymous Candidate"` before DTO serialization.

**Pagination Strategy:**
- Limit-Offset pagination for the full leaderboard (`GET /leaderboards/{assessment_uuid}`).
- Hard limit (`LIMIT 10`) for the widget endpoint (`GET /leaderboards/{assessment_uuid}/top`).

---

## 5. CERTIFICATION ENGINE

**Storage Model:**
- Introduce a new table: `certificates`
  - `uuid` (Primary lookup, forms the verification URL)
  - `organization_id`
  - `assessment_result_id` (Foreign key directly linking to the exact result row)
  - `result_version` (The specific version that earned the certificate)
  - `status` (`VALID`, `REVOKED`)
  - `issued_at`
  - `verification_code` (Unique alphanumeric string for offline/print verification)

**Revocation Handling:**
- The Orchestrator emits an event when `POST /recalculate` finishes.
- A listener inspects previous certificates for that attempt. If the new `Version N+1` has `pass_fail_status = FAIL`, the engine issues an `UPDATE certificates SET status = 'REVOKED'` for all certificates tied to earlier versions of that attempt.

---

## 6. PROPOSED CHANGES

### New Database Tables (Phase 217/218)
#### [NEW] `database/migrations/..._create_assessment_analytics_table.php`
#### [NEW] `database/migrations/..._create_certificates_table.php`

### Service Layer (Phases 217-220)
#### [NEW] `app/Modules/Results/Services/CandidateResultService.php`
#### [NEW] `app/Modules/Results/Services/AnalyticsAggregationService.php`
#### [NEW] `app/Modules/Results/Services/LeaderboardService.php`
#### [NEW] `app/Modules/Results/Services/CertificateGenerationService.php`

### API Layer (Phase 221)
#### [NEW] `app/Modules/Results/Controllers/CandidateResultsController.php`
#### [NEW] `app/Modules/Results/Controllers/AdminAnalyticsController.php`

---

## 7. OPEN QUESTIONS

1. **Analytics Storage:** Do we want to build physical `analytics_summaries` tables for persistence, or simply leverage Laravel's Cache facade (Redis) to cache heavy queries for 24 hours? Materialized tables are safer long-term but require new migrations.
2. **Certificate Generation:** Does the Certificate Engine need to generate a physical PDF and store it in S3, or simply provide the metadata DTO so the Angular frontend can render a verifiable HTML/CSS certificate view?

---

## 8. VERIFICATION PLAN

### Automated Tests
- Event Listener Tests verifying that `AnalyticsAggregationService` correctly increments pass rates when mocked `PUBLISHED` events fire.
- Leaderboard logic tests ensuring identical scores are correctly broken by `time_taken`.
- Certificate revocation tests proving that a recalculation from 80% to 60% safely revokes `Version 1` certificates.
