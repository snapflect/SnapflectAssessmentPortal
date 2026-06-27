# 202 Scoring OpenAPI Contract v1.0

**Document Version:** 1.0
**Phase:** Sprint 07 Phase 2
**Domain:** Assessment Scoring & Evaluation Engine
**Status:** READY FOR IMPLEMENTATION

---

## Executive Summary

This document defines the OpenAPI v3.0 contract for the Snapflect Assessment Scoring Engine. 

Following the rules established in `201_SCORING_ENGINE_RULEBOOK_v1.0`, this contract clearly separates candidate-facing result retrieval from administrative scoring operations. It ensures that the Angular frontend has highly optimized, strongly-typed endpoints to build the `ResultsStore` and candidate dashboards, while establishing strict security boundaries against unauthorized score tampering.

---

## 1. State Model Transition Lifecycle

The Scoring API endpoints rely heavily on the Attempt's current status.

| State | Context | Allowed Operations |
|---|---|---|
| `SUBMITTED` | Candidate has finalized the assessment. | Admin triggers POST `/score`. |
| `EVALUATING` | Engine is actively parsing and scoring. | Candidate receives `SCORING_IN_PROGRESS`. |
| `SCORED` | Final result and pass/fail achieved. | Candidate and Admin can view results. |
| `PENDING_GRADING` | Awaiting manual examiner input. | Candidate receives `MANUAL_GRADING_REQUIRED`. |

---

## 2. Endpoint Catalog

All routes are prefixed with `/api/v1`.

### 2.1 Candidate Endpoints (Role: `Candidate`)

| Method | Route | Description |
|---|---|---|
| `GET` | `/attempts/{attempt_uuid}/result` | Retrieves the top-level score and pass/fail status. |
| `GET` | `/attempts/{attempt_uuid}/competencies` | Retrieves the breakdown of scores by domain/skill. |
| `GET` | `/attempts/{attempt_uuid}/score-breakdown` | Retrieves high-level category performance. |

### 2.2 Administrative Endpoints (Role: `Admin`, `System`)

| Method | Route | Description |
|---|---|---|
| `POST` | `/attempts/{attempt_uuid}/score` | Triggers the async/sync scoring engine. |
| `POST` | `/attempts/{attempt_uuid}/recalculate` | Forces an audited score override/recalculation. |
| `GET` | `/attempts/{attempt_uuid}/audit` | Retrieves the line-item scoring ledger. |

---

## 3. DTO Schemas

### 3.1 `AttemptResultDto` (Candidate & Admin)
```json
{
  "attemptUuid": "uuid-v4",
  "assessmentUuid": "uuid-v4",
  "status": "SCORED",
  "rawScore": 85.5,
  "maxPossibleScore": 100.0,
  "percentage": 85.5,
  "passFailStatus": "PASS",
  "scoredAt": "2026-06-25T14:30:00Z"
}
```

### 3.2 `CompetencyScoreDto` (Candidate & Admin)
```json
{
  "competencyUuid": "uuid-v4",
  "competencyName": "API Architecture",
  "score": 18.0,
  "maxScore": 20.0,
  "percentage": 90.0,
  "passed": true
}
```
*Note: A GET request to `/competencies` returns `{ "competencies": [ CompetencyScoreDto ] }`.*

### 3.3 `ScoringAuditDto` (Admin Only)
```json
{
  "questionUuid": "uuid-v4",
  "candidateAnswer": ["opt-uuid-1", "opt-uuid-3"],
  "correctAnswer": ["opt-uuid-1", "opt-uuid-3"],
  "strategyApplied": "PROPORTIONAL",
  "maxScore": 5.0,
  "scoreAwarded": 5.0,
  "penaltyApplied": 0.0,
  "explanation": "Exact array match. Full credit awarded."
}
```
*Note: A GET request to `/audit` returns `{ "auditTrail": [ ScoringAuditDto ] }`.*

---

## 4. Error Schemas (RFC 7807 ProblemDetails)

All errors must adhere strictly to the RFC 7807 format.

| Error Code | HTTP Status | Description |
|---|---|---|
| `ATTEMPT_NOT_FOUND` | 404 Not Found | Attempt does not exist or belongs to another tenant. |
| `ATTEMPT_NOT_SUBMITTED` | 400 Bad Request | Cannot score an `ACTIVE` or `EXPIRED` attempt. |
| `SCORING_IN_PROGRESS` | 409 Conflict | Attempt is `EVALUATING`. Try again shortly. |
| `MANUAL_GRADING_REQUIRED`| 422 Unprocessable | Attempt is `PENDING_GRADING`. Manual intervention needed. |
| `RECALCULATION_NOT_ALLOWED`| 403 Forbidden | Attempt cannot be recalculated due to policy locks. |
| `UNAUTHORIZED` | 401 Unauthorized | Missing or invalid Sanctum token. |
| `FORBIDDEN` | 403 Forbidden | Candidate attempting to access Admin audit logs. |

---

## 5. Authorization Matrix

Strict tenant isolation and attempt ownership must be enforced at the API Controller level before any service is invoked.

| Resource | Candidate Owner | Other Candidate | Admin (Same Tenant) | Admin (Cross-Tenant) |
|---|---|---|---|---|
| `GET /result` | ✅ Allow | ❌ Deny (404) | ✅ Allow | ❌ Deny (404) |
| `GET /competencies` | ✅ Allow | ❌ Deny (404) | ✅ Allow | ❌ Deny (404) |
| `GET /audit` | ❌ Deny (403) | ❌ Deny (404) | ✅ Allow | ❌ Deny (404) |
| `POST /score` | ❌ Deny (403)* | ❌ Deny (404) | ✅ Allow | ❌ Deny (404) |
| `POST /recalculate` | ❌ Deny (403) | ❌ Deny (404) | ✅ Allow | ❌ Deny (404) |

*\* Note: Candidates trigger scoring implicitly when calling `POST /submit` on the Execution API. They cannot explicitly hit `POST /score`.*

---

## 6. Frontend Mapping Notes (Angular Signals)

These contracts are explicitly designed to feed cleanly into an upcoming Angular `ResultsStore`.

- **ResultsStore State:** The `AttemptResultDto` maps 1:1 to the root store state.
- **Competency Sub-Store:** The `Competencies` endpoint feeds directly into a computed signal for graphing (e.g., Radar/Spider charts).
- **Polling:** If `GET /result` returns a `409 SCORING_IN_PROGRESS`, the frontend is expected to use `rxjs/delay` and `retryWhen` to poll until the `SCORED` state is achieved.

---

## 7. Future Compatibility Notes

- **Manual Grading:** The `status: "PENDING_GRADING"` string allows the frontend to route the candidate to an "Awaiting Examiner" screen rather than crashing.
- **Versioning:** All routes are `v1`. If scoring models drastically change (e.g., AI-assisted grading algorithms), `v2` endpoints can be introduced without breaking the core `AttemptResultDto`.
- **Public Exposure:** No endpoints are exposed publicly. Future certificate verification will require a separate, unauthenticated `GET /certificates/{uuid}` endpoint out of scope for Sprint 07.

---

## Final Verdict

**Contract Status:** 🟢 **READY FOR IMPLEMENTATION**
