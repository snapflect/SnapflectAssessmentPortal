# 122 Execution API Implementation Plan v1.0

## Executive Summary
This implementation plan outlines the structural execution needed to expose the robust Sprint 06 Domain Services via the formalized `121_EXECUTION_API_OPENAPI_v1.0_REVISION_1` REST contract. The paramount architectural principle here dictates that the Controllers remain ultra-thin orchestration layers. They will solely handle transport validation, DTO synthesis, domain delegation, and JSON serialization. Absolutely zero business logic will seep into this API layer. 

## User Review Required

> [!NOTE]
> **Implementation Review**
> Please review the exception handler global registration strategy and the Controller mapping patterns before authorizing the explicit code generation phase.

---

## 1. Route Design
Routes will reside precisely inside the `routes/api.php` under an authenticated execution prefix mapping directly to the OpenAPI spec.

**Prefix:** `/api/v1`
**Middleware:** `['auth:sanctum' (or 'auth:api'), 'tenant.context']`
- `POST /assessments/{assessment_uuid}/launch`
- `GET /attempts/{attempt_uuid}/timer`
- `POST /attempts/{attempt_uuid}/save`
- `GET /attempts/{attempt_uuid}/resume`
- `POST /attempts/{attempt_uuid}/submit`

## 2. Controller Design
Controllers will be constructed to handle purely HTTP Orchestration.
- `AssessmentLaunchController@launch`
- `AttemptTimerController@show`
- `AttemptAutoSaveController@store`
- `AttemptResumeController@show`
- `AttemptSubmissionController@submit`

**Pattern:** 
1. Inject Request + Domain Service.
2. Build input DTO via `$request->validated()`.
3. Call Service method passing DTO, `$request->user()->id`, `$request->user()->organization_id`.
4. Wrap returning DTO inside API Resource.

## 3. Request Validation Strategy
Form Requests will handle strictly structural transport validation without invoking domain knowledge:
- `LaunchAttemptRequest`: Empty or minimal validation. UUID is in the route.
- `AutoSaveRequest`: Validates `questionUuid` (uuid format), `clientDraftVersion` (string/integer), `answerPayload` (nullable, mixed).
- `SubmitAttemptRequest`: Validates any lightweight wrapper.

## 4. API Resource Strategy
JSON Serialization formatting will leverage Laravel's `JsonResource`.
- `LaunchAttemptResource`
- `TimerStatusResource`
- `AutoSaveResource`
- `ResumeResource`
- `SubmissionResource`
Mapping directly translates output DTO properties identically to the OpenAPI camelCase requirements.

## 5. DTO Mapping Strategy
The API layer relies on the existing Sprint 06 Domain DTOs (`AutoSaveDto`, `ResumeResultDto`, etc.). No new DTOs will be invented unless strictly required to bridge a structural HTTP payload difference, ensuring tight data integration without redundancy.

## 6. ProblemDetails Strategy
We will implement an `ApiExceptionRenderer` trait or hook into `app/Exceptions/Handler.php`.
When catching Sprint 06 Domain Exceptions (`ResumeException`, `SubmissionException`, `AutoSaveException`, `SessionLaunchException`), the handler will output an RFC7807 payload:
```json
{
  "type": "https://api.snapflect.com/errors/stale-draft-version",
  "title": "Stale Draft Version",
  "status": 409,
  "detail": "Concurrency violation triggered.",
  "errorCode": "STALE_DRAFT_VERSION",
  "traceId": "123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2026-06-22T03:30:00Z"
}
```

## 7. JWT Authentication & Tenant Strategy
The API inherits the existing Authentication guards.
- **JWT Guard:** Evaluates token integrity.
- **Tenant Context:** Controllers extract `organizationId = auth()->user()->organization_id` seamlessly passing it down into Domain Services, completely eliminating the need to expose Tenant IDs in the HTTP URI or payload.

## 8. OpenAPI Alignment Matrix
| Route | OpenAPI Matches | Payload Mapping | Error Constraints |
| :--- | :--- | :--- | :--- |
| `/launch` | ✅ Yes | Maps `LaunchAttemptResponse` | `400`, `401`, `403`, `404` |
| `/timer` | ✅ Yes | Maps `TimerStatusResponse` | `401`, `403`, `404` |
| `/save` | ✅ Yes | Maps `AutoSaveResponse` | `401`, `403`, `404`, `409` |
| `/resume` | ✅ Yes | Maps `ResumeResponse` | `401`, `403`, `404`, `500` |
| `/submit` | ✅ Yes | Maps `SubmissionResponse` | `400`, `401`, `403`, `404`, `500` |

## 9. Angular Integration Matrix
- **State Store (NgRx/Signals):** Endpoints directly map back `questionUuid`, `snapshotSchemaVersion`, and accurate Timer state `Enums`, ensuring the Angular clients don't suffer stale local signals or trigger N+1 roundtrips.
- **Evidence Screen Routing:** Final submission outputs `submissionUuid` returning a synchronous hook to redirect users instantly to the confirmation page.

## 10. Testing Strategy
- **Feature Tests:** Full suite hitting HTTP endpoints, asserting:
  - 2xx Response JSON structure matching OpenAPI exactly.
  - RFC7807 problem structures returned on 4xx/5xx faults.
  - 401/403 triggers on spoofed headers/tokens.

## 11. Security & Performance Findings
- **Security:** Pure JWT extraction. Domain rules (Timer blocks, Submission locks) are fully shielded.
- **Performance:** Controllers instantiate Zero DB queries independently. All performance footprints strictly rest upon the highly optimized Sprint 06 engines.

## 12. Implementation Risks
- **Exception Handler Override:** Intercepting all Domain Exceptions to reformat them into RFC7807 requires modifying the global Exception Handler, which may affect other non-API endpoints if not scoped tightly to the `/api/*` prefix.

## 13. Files Expected To Be Created
- `app/Http/Controllers/Api/V1/Delivery/...` (5 Controllers)
- `app/Http/Requests/Delivery/...` (3 Form Requests)
- `app/Http/Resources/Delivery/...` (5 API Resources)
- `tests/Feature/Api/Delivery/...` (Execution APIs Feature Tests)

## 14. Files Expected To Be Modified
- `routes/api.php`
- `app/Exceptions/Handler.php`

## 15. Acceptance Criteria
- Endpoints completely map to `121_EXECUTION_API_OPENAPI_v1.0_REVISION_1`.
- Controllers contain 0 lines of actual domain logic.
- RFC7807 `ProblemDetails` correctly returns all error bounds with `traceId`.

## 16. Implementation Recommendation
**GO.** 
The plan seamlessly encapsulates the Sprint 06 Domain Services using strict MVC standards without rewriting any core operational code.

## 17. Final Verdict
This API Exposure layer is comprehensively planned. I am halting here as commanded. Awaiting authorization to commence generation of Controllers, Requests, Resources, and Feature Tests.
