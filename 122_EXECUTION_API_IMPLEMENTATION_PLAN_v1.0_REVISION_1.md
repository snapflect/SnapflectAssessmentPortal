# 122 Execution API Implementation Plan v1.0 Revision 1

## Executive Summary
This revised implementation plan establishes the architectural blueprint for the **Execution API Exposure Layer**. Building atop the Sprint 06 Domain Services and formally governed by `121_EXECUTION_API_OPENAPI_v1.0_REVISION_1`, this tier dictates absolute isolation of context resolution, Single Action Invokable Controllers, RFC7807 problem rendering locked purely to API routes, and airtight compliance testing preventing future OpenAPI drift.

## User Review Required

> [!NOTE]
> **Readiness Review Authorization**
> Please verify the 10 corrections are accurately captured below. Upon approval, I will proceed to generate `123_EXECUTION_API_READINESS_REVIEW` (or proceed directly to code generation based on your directives).

---

## 1. Route Strategy & API Version Isolation (Correction 4)
Routes will be decoupled from the global `api.php` file to maintain versioning boundaries and module cleanliness.
- **File:** `routes/api/v1/execution.php`
- **Mapping:** Loaded explicitly within `RouteServiceProvider` or a dedicated Module Provider mapped specifically to the `api/v1` prefix.
- **Endpoints:**
  - `POST /assessments/{assessment_uuid}/launch`
  - `GET /attempts/{attempt_uuid}/timer`
  - `POST /attempts/{attempt_uuid}/save`
  - `GET /attempts/{attempt_uuid}/resume`
  - `POST /attempts/{attempt_uuid}/submit`

## 2. Controller Strategy (Correction 5)
Every endpoint maps to a dedicated **Single Action Controller** utilizing the `__invoke()` signature. Controllers remain utterly devoid of business logic, state, and domain definitions.
- `AssessmentLaunchController@__invoke`
- `AttemptTimerController@__invoke`
- `AttemptAutoSaveController@__invoke`
- `AttemptResumeController@__invoke`
- `AttemptSubmissionController@__invoke`

## 3. Context Resolution Strategy (Correction 1)
Directly invoking `$request->user()` or `auth()->user()` inside Controllers heavily couples the HTTP layer to the Authentication Guards. 
- **Implementation:** Introduce an `AuthenticatedUserContext` or `TenantContextResolver` injected directly into the controller's constructor or method.
- **Responsibility:** The resolver extracts and provides `$userId` and `$organizationId` securely. The Controllers orchestrate passing these properties to the underlying Sprint 06 Domain Services without hardcoding explicit Session/JWT knowledge.

## 4. Request Validation & API Resource Strategy
- **Validation:** Standard Laravel Form Requests handle raw input validation (e.g., checking UUID bounds, structure matching `AutoSaveRequest`).
- **Resources:** `JsonResource` transformers perfectly map domain `ResultDto` outputs into the literal CamelCase properties enforced by OpenAPI without querying relationships.

## 5. ProblemDetails Strategy (Correction 2)
The application will employ an isolated `ApiProblemDetailsRenderer` preventing API-formatting rules from leaking into web UI or Admin portal exceptions.
- **Scope:** Active exclusively on `request()->is('api/*')`.
- **Payload:** Maps exceptions (e.g., `STALE_DRAFT_VERSION`) rigidly into RFC7807 arrays generating robust outputs containing `type`, `title`, `status`, `detail`, `errorCode`, dynamic `traceId`, and UTC `timestamp`.

## 6. OpenAPI Compliance Testing Strategy (Correction 3)
Beyond functional tests, strict OpenAPI Schema conformity tests are required.
- **Validation Matrices:** Asserts required fields exist in payloads, non-null guarantees are met, HTTP responses perfectly match the matrix (400, 401, 403, 404, 409, 500), and `ProblemDetails` structures maintain exact JSON schema types. Preventing contract drift guarantees Angular compatibility indefinitely.

## 7. Angular Integration Strategy (Correction 6)
Aligning tightly with the Sprint 05 frontend architecture:
- **Architecture:** The API directly supports the exact models consumed by Angular **Signals**, **Signal Stores**, and the **DeliveryFacade**.
- **Compatibility:** Response payloads are perfectly synthesized to prevent $N+1$ requests. Exposing `status` enums, `snapshotSchemaVersion`, and accurate Timer offsets means the `DeliveryStore`, `AttemptStore`, and `SessionStore` can natively reconcile auto-saves concurrently without fetching re-hydrated states.

## 8. Explicit Test Strategies (Corrections 7 & 8)
- **Context Resolution Tests:** Verify `TenantContextResolver` accurately produces tenant limits and asserts Cross-Tenant Denial functions securely without exposing identifiers.
- **ProblemDetails Tests:** Verify `traceId` uniqueness, accurate UTC `timestamp` generation, proper API-only restriction isolation, and `errorCode` mapping precision matching the Domain rules.

## 9. Implementation Risk Review (Correction 9)
| Risk | Probability | Mitigation Strategy |
| :--- | :--- | :--- |
| **Context Resolver Complexity** | Low | Keeping the Resolver as a minimal wrapper around Auth/Tenant bindings. Fully covered by Unit Tests validating cross-tenant boundaries. |
| **OpenAPI Drift Risk** | Medium | Eliminated through the addition of explicit **OpenAPI Compliance Tests** structurally asserting payloads dynamically against specs. |
| **Exception Mapping Leakage** | Medium | `ApiProblemDetailsRenderer` explicitly filters requests matching `api/*` prefixes protecting global `web` fallback paths. |
| **Route Versioning Risk** | Low | Scoping `routes/api/v1/execution.php` into the routing provider strictly maps domains, preparing easy migrations to `v2` later. |
| **Angular Contract Mismatch** | Low | Endpoints map meticulously to Signal parameters. `questionUuid` attached to Save ensures direct Signal array mutation. |

## 10. Readiness Criteria
The API layer implementation will only proceed past the `123_EXECUTION_API_READINESS_REVIEW` if:
- [ ] OpenAPI Alignment Strategy is verified.
- [ ] Context Resolution & Single Action Controller Architecture is verified.
- [ ] ProblemDetails Scoping is verified.
- [ ] Route V1 module isolation is verified.
- [ ] Angular Signal compatibility is verified.
- [ ] Full Security and Integration Testing maps are approved.

## 11. Final Verdict
The API Exposure Layer plan is formally revised and tightened, fully isolating the HTTP orchestration boundaries from framework coupling. I am awaiting final approval before proceeding.
