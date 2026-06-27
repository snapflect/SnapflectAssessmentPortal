# 121 Execution API OpenAPI v1.0

This document defines the RESTful contract for exposing the Sprint 06 Assessment Execution Engines. It formally bridges the gap identified during earlier phases, providing frontend clients with secure, idempotent, and architecturally verified pathways to Launch, Save, Resume, and Submit attempts.

```yaml
openapi: 3.0.3
info:
  title: Snapflect Assessment Execution API
  description: Official OpenAPI contract exposing the Assessment Execution Lifecycle Engine (Sprint 06).
  version: 1.0.0
servers:
  - url: https://api.snapflect.com/api/v1
    description: Production Server

security:
  - BearerAuth: []

paths:
  /attempts/{attempt_uuid}/launch:
    post:
      summary: Launch Session
      description: |
        Initializes a new assessment session. Generates the snapshot and randomizes delivery matrices.
        Corresponds to the Session Launch Engine.
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
              $ref: '#/components/schemas/LaunchAttemptRequest'
      responses:
        '201':
          description: Successful launch. Attempt created.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LaunchAttemptResponse'
        '400':
          description: Bad request (e.g., Assessment is in DRAFT state)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProblemDetails'

  /attempts/{attempt_uuid}/timer:
    get:
      summary: Retrieve Timer State
      description: Returns the server-authoritative UTC timer state.
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
        '404':
          description: ATTEMPT_NOT_FOUND
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProblemDetails'

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
        '409':
          description: STALE_DRAFT_VERSION - Concurrency violation.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProblemDetails'
        '422':
          description: ATTEMPT_EXPIRED or ATTEMPT_SUBMITTED. Blocked.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProblemDetails'

  /attempts/{attempt_uuid}/resume:
    get:
      summary: Resume Execution State
      description: |
        Idempotently recovers the exact execution state, returning identical 
        question matrices, option permutations, and saved draft answers without mutating the database.
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
        '403':
          description: ATTEMPT_EXPIRED or INVALID_ATTEMPT_STATE
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProblemDetails'
        '500':
          description: RANDOMIZATION_DATA_CORRUPTED or DRAFT_DATA_CORRUPTED
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProblemDetails'

  /attempts/{attempt_uuid}/submit:
    post:
      summary: Finalize Submission
      description: |
        Permanently terminates execution. Locks the Attempt status and generates an 
        immutable Evidence receipt.
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
        '422':
          description: SNAPSHOT_NOT_FOUND or RANDOMIZATION_DATA_CORRUPTED
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
        JWT token enforcing Tenant Isolation (Organization Context) and User Context authentication boundaries.

  schemas:
    LaunchAttemptRequest:
      type: object
      properties:
        assessmentUuid:
          type: string
          format: uuid
      required:
        - assessmentUuid

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
        completionPercentage:
          type: number
          format: float

    SubmitAttemptRequest:
      type: object
      description: Lightweight container typically left empty unless injecting manual metadata.

    SubmissionResponse:
      type: object
      properties:
        attemptUuid:
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
```
