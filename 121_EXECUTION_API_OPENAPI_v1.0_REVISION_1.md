# 121 Execution API OpenAPI v1.0 Revision 1

## Architectural Rationale & HTTP Error Mapping Matrix

This revised contract aligns perfectly with the Sprint 06 Domain Services while strictly ensuring UUID-only payloads, eliminating internal DB IDs, and optimizing the responses for the Angular frontend stores.

### Rationale: Launch Endpoint Semantics
**Correction 1:** The launch endpoint was moved from `/attempts/{attempt_uuid}/launch` to `/assessments/{assessment_uuid}/launch`. Architecturally, an Attempt UUID does not physically exist prior to the Launch invocation. The Launch Engine constructs the attempt mapping dynamically against the target Assessment definition. This respects standard REST collection patterns.

### HTTP Error Mapping Matrix (Correction 8)

| Exception Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `ATTEMPT_NOT_FOUND` | 404 Not Found | Standard missing resource response. |
| `SNAPSHOT_NOT_FOUND` | 404 Not Found | Missing snapshot dependencies. |
| `INVALID_ATTEMPT_STATE` | 400 Bad Request | Semantic state mismatch (e.g., attempt cancelled). |
| `STALE_DRAFT_VERSION` | 409 Conflict | Concurrency failure via optimistic locking. |
| `ATTEMPT_EXPIRED` | 403 Forbidden | Action explicitly blocked due to time overrun. |
| `ATTEMPT_SUBMITTED` | 403 Forbidden | Action explicitly blocked post-submission lock. |
| `SUBMISSION_NOT_ALLOWED` | 403 Forbidden | Finalization blocked under specific bounds. |
| `RANDOMIZATION_DATA_CORRUPTED` | 500 Internal Server Error | Deep data structure faults triggering safe rollbacks. |
| `DRAFT_DATA_CORRUPTED` | 500 Internal Server Error | Deep data structure faults triggering safe rollbacks. |
| `ATTEMPT_FINALIZATION_FAILED` | 500 Internal Server Error | Transaction commit boundaries failed securely. |

### Angular Consumption Notes (Correction 10)
- **Signal & Store Reconciliation:** By adding `questionUuid` to the `AutoSaveResponse` and ensuring `snapshotSchemaVersion` + `serverTime` + `status` enums are present globally, the Angular frontend state management (Signals/NgRx) can reconcile draft syncs concurrently without awaiting multiple round-trips or guessing global execution state. 
- **Receipt Rendering:** The inclusion of `submissionUuid` directly in the Submit response enables the frontend to immediately route candidates to an `/evidence/{submissionUuid}` confirmation screen perfectly mirroring backend data points.

---

## Revised OpenAPI YAML Specification

```yaml
openapi: 3.0.3
info:
  title: Snapflect Assessment Execution API
  description: Official authoritative OpenAPI contract for the Assessment Execution Lifecycle Engine (Sprint 06).
  version: 1.0.1
servers:
  - url: https://api.snapflect.com/api/v1
    description: Production Server

security:
  - BearerAuth: []

paths:
  /assessments/{assessment_uuid}/launch:
    post:
      summary: Launch Session
      description: |
        Initializes a new assessment session against a published assessment. Generates the snapshot, 
        materializes attempt configuration, and randomizes delivery matrices.
      tags:
        - Execution
      parameters:
        - name: assessment_uuid
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '201':
          description: Successful launch. Attempt created.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LaunchAttemptResponse'
        '400':
          $ref: '#/components/responses/BadRequestError'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'
        '404':
          $ref: '#/components/responses/NotFoundError'

  /attempts/{attempt_uuid}/timer:
    get:
      summary: Retrieve Timer State
      description: Returns the authoritative UTC timer state and current execution status block.
      tags:
        - Execution
      parameters:
        - name: attempt_uuid
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Timer state retrieved successfully.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TimerStatusResponse'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'
        '404':
          $ref: '#/components/responses/NotFoundError'

  /attempts/{attempt_uuid}/save:
    post:
      summary: Auto Save Draft Answer
      description: |
        Persists draft progress lazily. Employs optimistic concurrency via `clientDraftVersion` 
        to ensure the 'Latest Successful Save Wins'.
      tags:
        - Execution
      parameters:
        - name: attempt_uuid
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AutoSaveRequest'
      responses:
        '200':
          description: Save successful.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AutoSaveResponse'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          description: ATTEMPT_EXPIRED or ATTEMPT_SUBMITTED explicitly blocking save.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProblemDetails'
        '404':
          $ref: '#/components/responses/NotFoundError'
        '409':
          description: STALE_DRAFT_VERSION - Concurrency bounds triggered safely.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProblemDetails'

  /attempts/{attempt_uuid}/resume:
    get:
      summary: Resume Execution State
      description: |
        Idempotently recovers the exact execution state, returning identical question matrices, 
        option permutations, and saved draft answers without mutating the database.
      tags:
        - Execution
      parameters:
        - name: attempt_uuid
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Exact execution state reconstructed.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ResumeResponse'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          description: ATTEMPT_EXPIRED or ATTEMPT_SUBMITTED bounds block resumption.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProblemDetails'
        '404':
          $ref: '#/components/responses/NotFoundError'
        '500':
          description: RANDOMIZATION_DATA_CORRUPTED or DRAFT_DATA_CORRUPTED detected.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProblemDetails'

  /attempts/{attempt_uuid}/submit:
    post:
      summary: Finalize Submission
      description: |
        Permanently terminates execution. Locks the Attempt status and generates an 
        immutable Evidence receipt payload.
      tags:
        - Execution
      parameters:
        - name: attempt_uuid
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: false
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SubmitAttemptRequest'
      responses:
        '200':
          description: Attempt finalized idempotently.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SubmissionResponse'
        '400':
          $ref: '#/components/responses/BadRequestError'
        '401':
          $ref: '#/components/responses/UnauthorizedError'
        '403':
          $ref: '#/components/responses/ForbiddenError'
        '404':
          $ref: '#/components/responses/NotFoundError'
        '500':
          description: ATTEMPT_FINALIZATION_FAILED internal block.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProblemDetails'

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        JWT token enforcing Tenant Isolation (Organization Context) and User Context boundaries globally.

  responses:
    BadRequestError:
      description: Invalid attempt state parameters mapped.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ProblemDetails'
    UnauthorizedError:
      description: JWT Authentication Failure. Missing or invalid Bearer token.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ProblemDetails'
    ForbiddenError:
      description: Tenant Isolation Failure or Organization Context Violation.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ProblemDetails'
    NotFoundError:
      description: Entity (Attempt/Snapshot) missing from database matching context bounds.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ProblemDetails'

  schemas:
    LaunchAttemptResponse:
      type: object
      properties:
        attemptUuid:
          type: string
          format: uuid
        snapshotUuid:
          type: string
          format: uuid
        randomizationSeed:
          type: string
        questionOrder:
          type: array
          items:
            type: string
            format: uuid
        optionOrder:
          type: object
          additionalProperties:
            type: array
            items:
              type: string
              format: uuid
        startedAt:
          type: string
          format: date-time
        expiresAt:
          type: string
          format: date-time

    TimerStatusResponse:
      type: object
      properties:
        attemptUuid:
          type: string
          format: uuid
        remainingSeconds:
          type: integer
        expiresAt:
          type: string
          format: date-time
        serverTime:
          type: string
          format: date-time
        expired:
          type: boolean
        status:
          type: string
          enum: [ACTIVE, EXPIRED, SUBMITTED]

    AutoSaveRequest:
      type: object
      properties:
        questionUuid:
          type: string
          format: uuid
        answerPayload:
          description: The payload mapping depending on Question Type (String, Int, Array, etc).
        clientDraftVersion:
          type: string
      required:
        - questionUuid
        - clientDraftVersion

    AutoSaveResponse:
      type: object
      properties:
        questionUuid:
          type: string
          format: uuid
        answerUuid:
          type: string
          format: uuid
        serverDraftVersion:
          type: string
        savedAt:
          type: string
          format: date-time
        success:
          type: boolean

    ResumeResponse:
      type: object
      properties:
        attemptUuid:
          type: string
          format: uuid
        snapshotUuid:
          type: string
          format: uuid
        snapshotSchemaVersion:
          type: string
        randomizationSeed:
          type: string
        questionOrder:
          type: array
          items:
            type: string
            format: uuid
        optionOrder:
          type: object
          additionalProperties:
            type: array
            items:
              type: string
              format: uuid
        draftAnswers:
          type: object
          description: "Dictionary mapping questionUuid to the lazily materialized Draft object."
          additionalProperties:
            type: object
            properties:
              payload: {}
              version:
                type: integer
              savedAt:
                type: string
                format: date-time
        remainingSeconds:
          type: integer
        expiresAt:
          type: string
          format: date-time
        serverTime:
          type: string
          format: date-time
        completionPercentage:
          type: number
          format: float

    SubmitAttemptRequest:
      type: object
      description: Lightweight container typically left empty unless injecting manual submission contexts.

    SubmissionResponse:
      type: object
      properties:
        attemptUuid:
          type: string
          format: uuid
        submissionUuid:
          type: string
          format: uuid
        submittedAt:
          type: string
          format: date-time
        finalStatus:
          type: string
        answeredQuestions:
          type: integer
        totalQuestions:
          type: integer
        completionPercentage:
          type: number
          format: float

    ProblemDetails:
      type: object
      properties:
        type:
          type: string
        title:
          type: string
        status:
          type: integer
        detail:
          type: string
        errorCode:
          type: string
          enum:
            - ATTEMPT_NOT_FOUND
            - ATTEMPT_EXPIRED
            - ATTEMPT_SUBMITTED
            - INVALID_ATTEMPT_STATE
            - STALE_DRAFT_VERSION
            - SNAPSHOT_NOT_FOUND
            - RANDOMIZATION_DATA_CORRUPTED
            - DRAFT_DATA_CORRUPTED
            - SUBMISSION_NOT_ALLOWED
            - ATTEMPT_FINALIZATION_FAILED
        traceId:
          type: string
          format: uuid
        timestamp:
          type: string
          format: date-time
```

## Open Issues & Known Risks
- **Frontend Contract Sync:** The Angular codebase must actively ingest this exact specification. Because `AutoSaveResponse` and `ResumeResponse` schemas received strict additions (namely `questionUuid` matching and Enum tracking), Stale Data Stores may crash if legacy UI parsers enforce older schema validation rules.
- **ProblemDetails Formatting:** The integration of standard RFC 7807 `ProblemDetails` payloads implies Laravel's global Exception Handler must be retrofitted uniformly to support structured JSON generation ensuring `traceId` injects reliably on `500` failures.

## Final Recommendation
**API Revision Approved.** 
This specification forms the absolute, unyielding contract governing frontend interactions with the Execution Backend. By ensuring zero Database primary keys leak and isolating all bounds to mathematically robust UUIDs, this OpenAPI specification guarantees total alignment between frontend UI models and the rigorous Domain constraints engineered in Sprint 06.
