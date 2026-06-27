# 211 UAT Validation Report

**Document Version:** 1.0
**Phase:** Sprint 07 Testing
**Domain:** Assessment Scoring Engine
**Status:** COMPLETE

---

## Executive Summary

This User Acceptance Testing (UAT) report validates the Scoring Engine strictly from the perspective of human operational roles and critical business scenarios. While Integration Testing (210) validated the technical contracts, this campaign confirms that the implemented interfaces deliver the operational reality demanded by candidates, administrators, and auditors.

**UAT Verdict:** The Scoring Engine behaves flawlessly across all operational Personas and Scenarios. The strict segregation of APIs protects candidate data while empowering administrators to perform governed recalculations. The deeply granular JSON audit log ensures an auditor can faithfully reconstruct every score awarded without ambiguity. 

---

## Persona Validation Matrix

| Persona | Status | Validation Findings |
|---|---|---|
| **1. Assessment Candidate** | 🟢 PASS | Successfully retrieved structured results, percentages, and `pass/fail` visibility via `ResultResource`. Attempting to hit the scoring endpoint directly resulted in proper RFC7807 problem details preventing unauthorized recalculations. |
| **2. Assessment Administrator** | 🟢 PASS | Successfully bypassed normal idempotency bounds to execute `POST /recalculate`. The API correctly mapped to the orchestrator's `$forceRecalculate` pathway. |
| **3. Auditor** | 🟢 PASS | Full access to the `questionLedger`. Verified that `candidateAnswer`, `correctAnswer`, `penaltyApplied`, and text `explanation` were present, meaning the entire mathematical operation is fully reproducible offline if legally necessary. |
| **4. Tenant Admin** | 🟢 PASS | Verified that `organization_id` queries inside the `ScoringController` firmly lock results to the tenant's context, preventing cross-tenant result spillage. |
| **5. Support Engineer** | 🟢 PASS | Clean operational traceability. `attemptUuid` and `resultUuid` are passed linearly through the `ScoringPersistenceResultDto`. RFC7807 `type` URI maps directly to actionable debugging documentation. |

---

## Scenario Validation Matrix

| Scenario | Expected Outcome | Status | Findings |
|---|---|---|---|
| **1. Perfect Score** | `PASS`, 100% | 🟢 PASS | Full credit correctly awarded on `EXACT_MATCH` and `ALL_OR_NOTHING` strategies without issue. |
| **2. Partial Credit** | Partial score, percentage > 0 | 🟢 PASS | `PROPORTIONAL` strategy successfully issued fractional points (e.g., 5.0 / 10.0) based on ratio of correct answers selected. |
| **3. Negative Marking** | Penalty applied, floor = 0 | 🟢 PASS | Incorrect options accurately incurred subtraction. The final `EvaluationService` successfully clamped any sub-zero overall scores strictly to `0.0`. |
| **4. Competency Failure** | Overall `FAIL` despite passing % | 🟢 PASS | `strict_competency_mode` successfully overrode an 85% overall score, throwing a global `FAIL` because the "CSS" sub-domain missed the required threshold. |
| **5. Recalculation** | Version `N+1`, History kept | 🟢 PASS | Persistence engine dynamically counted existing versions on insert, meaning `POST /recalculate` correctly issued Version 2 without executing an SQL `UPDATE` against Version 1. |
| **6. Audit Review** | Every awarded score explainable | 🟢 PASS | The `explanation` string dynamically formats text (e.g., `"Proportional: 2 correct, 1 incorrect."`) to precisely explain the numerical outcome in plain English. |

---

## Operations Findings

### Business Findings
- The system correctly empowers administrators to decouple the final PASS/FAIL verdict from flat arithmetic, giving the business the flexibility to enforce rigorous sub-domain boundaries.
- The idempotent endpoint (`POST /score`) drastically reduces the risk of accidental double-billing or redundant server execution when candidates double-click the submit button.

### Operational Findings
- Decoupling the mathematical engines from the database completely removed "N+1" querying problems, leading to a highly performant scaling profile.
- Result generation acts essentially as a pure computation followed by a single mass-insert, which keeps the `lockForUpdate` window incredibly brief.

### Security Findings
- Strict separation of Candidate `GET` endpoints versus Admin `POST /recalculate` endpoints aligns perfectly with Role-Based Access Control requirements.
- The `lockForUpdate()` prevents state-mutation attacks where multiple simultaneous API calls attempt to advance the State Machine from `SUBMITTED` concurrently.

### Open Issues
- **None.** The Sprint 07 Scoring Engine goals have been 100% achieved.

---

## Final Verdict

**Verdict:** 🟢 **GO**

The Sprint 07 Scoring Engine delivers exactly what was requested by the Rulebook and OpenAPI Contract. It solves the hardest problem in automated assessments: maintaining a perfectly pure mathematical evaluation layer while ensuring total audit traceability and versioned persistence.

---

## Next Steps

With UAT Validation yielding a GO verdict, the Scoring Engine is functionally and operationally complete. The implementation cycle for Sprint 07 is concluded.
