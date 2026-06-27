# 214 Results OpenAPI Contract

**Document Version:** 1.0
**Phase:** Sprint 08 Planning
**Domain:** Results & Reporting API

---

## 1. EXECUTIVE SUMMARY

This OpenAPI contract defines the strictly governed REST interface for consuming Sprint 07 Scoring Engine outputs. It serves as the definitive contract between the backend persistence layer and the frontend Angular application (Results Store, Analytics Store). 

The contract enforces strict `visibility` policies dictated by the assessment blueprint, ensuring candidates only see data they are authorized to view (such as passing status or competency breakdowns), while simultaneously providing unrestricted, aggregate analytical access to administrators. It also defines public/semi-public routes for Leaderboards and Certificate Verification.

---

## 2. ENDPOINT CATALOG

### 2.1 Candidate Endpoints
*Base Path: `/api/v1/candidates`*

| Method | Endpoint | Description | Auth Requirement |
|---|---|---|---|
| `GET` | `/results/{result_uuid}` | Fetch core attempt result (score, pass/fail) based on blueprint visibility. | Candidate Owner |
| `GET` | `/results/{result_uuid}/competencies` | Fetch domain radar data. Returns `403` if `show_competencies` is false. | Candidate Owner |
| `GET` | `/results/history` | Paginated historical attempts across all assessments for the candidate. | Candidate Owner |
| `GET` | `/results/{result_uuid}/certificate` | Fetch certificate UUID/URL. Returns `404` if not generated or revoked. | Candidate Owner |
| `GET` | `/results/{result_uuid}/leaderboard-position`| Fetch relative rank. Returns `403` if `leaderboard_enabled` is false. | Candidate Owner |

### 2.2 Admin Endpoints
*Base Path: `/api/v1/admin`*

| Method | Endpoint | Description | Auth Requirement |
|---|---|---|---|
| `GET` | `/results` | Paginated global attempt history. | Tenant Admin |
| `GET` | `/results/{result_uuid}` | Fetch unrestricted, raw candidate result data. | Tenant Admin |
| `GET` | `/results/{result_uuid}/audit` | Fetch the full `question_ledger` JSON payload. | Tenant Admin |
| `GET` | `/analytics/assessments` | Aggregate pass rates and averages across assessments. | Tenant Admin |
| `GET` | `/analytics/competencies` | Cross-cohort competency averages. | Tenant Admin |
| `GET` | `/analytics/questions` | Difficulty and pass-rate metrics per question. | Tenant Admin |

### 2.3 Leaderboard Endpoints
*Base Path: `/api/v1/leaderboards`*

| Method | Endpoint | Description | Auth Requirement |
|---|---|---|---|
| `GET` | `/{assessment_uuid}` | Paginated leaderboard for a specific cohort. | Tenant User |
| `GET` | `/{assessment_uuid}/top` | Top 10/25 ranks for widget displays. | Tenant User |

### 2.4 Certificate Endpoints
*Base Path: `/api/v1/certificates`*

| Method | Endpoint | Description | Auth Requirement |
|---|---|---|---|
| `GET` | `/{certificate_uuid}` | Fetch public metadata for a specific certificate. | Public / Tenant |
| `GET` | `/verify/{verification_code}` | Public verification check. Returns `VALID` or `REVOKED`. | Public |

---

## 3. DTO SCHEMAS

### 3.1 CandidateResultDto
```json
{
  "resultUuid": "uuid",
  "assessmentName": "string",
  "publishedAt": "iso8601",
  "resultVersion": "integer",
  "score": "float|null",
  "percentage": "float|null",
  "passFailStatus": "string|null"
}
```
*Note: `score`, `percentage`, and `passFailStatus` will be `null` if the blueprint visibility flags restrict them.*

### 3.2 CompetencyDto
```json
{
  "competencyUuid": "uuid",
  "competencyName": "string",
  "percentage": "float",
  "passed": "boolean"
}
```

### 3.3 LeaderboardDto
```json
{
  "rank": "integer",
  "candidateName": "string", 
  "score": "float",
  "timeTakenSeconds": "integer",
  "isCurrentUser": "boolean"
}
```
*Note: `candidateName` resolves to "Anonymous Candidate" if privacy opt-out is enabled.*

### 3.4 CertificateDto
```json
{
  "certificateUuid": "uuid",
  "verificationCode": "string",
  "status": "VALID | REVOKED",
  "issuedAt": "iso8601",
  "candidateName": "string",
  "assessmentName": "string",
  "downloadUrl": "url"
}
```

### 3.5 AnalyticsDto
```json
{
  "assessmentUuid": "uuid",
  "attemptCount": "integer",
  "passRatePercentage": "float",
  "averageScorePercentage": "float",
  "competencyBreakdowns": [
    { "competencyName": "string", "averagePercentage": "float" }
  ],
  "questionDifficultyMetrics": [
    { "questionUuid": "uuid", "passRatePercentage": "float" }
  ]
}
```

### 3.6 AuditTrailDto
```json
{
  "auditUuid": "uuid",
  "auditType": "string",
  "performedAt": "iso8601",
  "evaluation": { ... },
  "questionLedger": [ { "questionUuid": "...", "candidateAnswer": [...], "scoreAwarded": 10.0 } ]
}
```

---

## 4. VISIBILITY MATRIX

| Feature | Governed By (Blueprint Flag) | Enforcement Layer | Candidate Experience if False |
|---|---|---|---|
| Raw Score | `score_visibility` | API Controller | Field returns `null` |
| Pass/Fail | `pass_fail_visibility` | API Controller | Field returns `null` |
| Radar Chart | `show_competencies` | API Controller | `403 Forbidden` on endpoint |
| Breakdown | `show_question_breakdown` | API Controller | `403 Forbidden` on endpoint |
| Correct Ans | `show_correct_answers` | API Controller | Specific payload nodes omitted |
| Ranking | `leaderboard_enabled` | API Controller | `403 Forbidden` on endpoint |

---

## 5. ERROR MATRIX (RFC7807)

| Condition | Status | Type URI | Title |
|---|---|---|---|
| Unpublished | `403` | `.../errors/result-not-published` | Result Not Published |
| Visibility Off| `403` | `.../errors/visibility-restricted`| Data Visibility Restricted |
| No Leaderboard| `403` | `.../errors/leaderboard-disabled` | Leaderboard Disabled |
| Revoked Cert | `403` | `.../errors/certificate-revoked` | Certificate Revoked |
| Bad Result ID | `404` | `.../errors/result-not-found` | Result Not Found |
| Wrong Tenant | `403` | `.../errors/forbidden` | Access Denied |

---

## 6. AUTHORIZATION MATRIX

| Resource | Candidate | Admin | Public |
|---|---|---|---|
| Own Result | ✅ Yes | ✅ Yes | ❌ No |
| Other Result | ❌ No | ✅ Yes | ❌ No |
| Audit Trail | ❌ No | ✅ Yes | ❌ No |
| Leaderboard | ✅ If Enabled | ✅ Yes | ❌ No |
| Analytics | ❌ No | ✅ Yes | ❌ No |
| Cert Verify | ❌ No | ✅ Yes | ✅ Yes (With Code) |

---

## 7. FRONTEND MAPPING NOTES

### Angular Signals & Stores
- **Results Store (`DeliveryStore` integration):** The DTOs are flattened specifically to play cleanly with Angular Signals. By using primitive arrays inside `CompetencyBreakdowns`, the UI can map directly to Chart.js or ECharts configurations using `@Computed()` signals without expensive mapping operations.
- **Null Safety:** The UI must use `@If(result().score !== null)` to render score widgets. The UI must cleanly fallback to generic "Assessment Complete" states when visibility rules strip the payload data.
- **Leaderboard Store:** Real-time (or near real-time) polling will require lightweight DTOs. The `LeaderboardDto` intentionally excludes nested attempt data to ensure `GET /top` can be queried rapidly without significant backend joining.

---

## FINAL VERDICT

**READY FOR IMPLEMENTATION PLANNING**
