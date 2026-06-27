# Sprint 06 Phase 3: Session Launch Engine

## Files Created
- `database/migrations/2026_06_22_000000_alter_assessment_sessions_make_snapshot_nullable.php`
- `app/Modules/Delivery/DTOs/LaunchSessionDto.php`
- `app/Modules/Delivery/DTOs/LaunchResultDto.php`
- `app/Modules/Delivery/Exceptions/SessionLaunchException.php`
- `app/Modules/Delivery/Services/SessionStateMachine.php`
- `app/Modules/Assessment/Services/SnapshotGenerationService.php`
- `app/Modules/Delivery/Services/AttemptCreationService.php`
- `app/Modules/Delivery/Services/SessionLaunchService.php`
- `app/Modules/Delivery/Controllers/SessionLaunchController.php`
- `app/Modules/Delivery/Resources/LaunchResultResource.php`
- `tests/Unit/Modules/Delivery/Services/SessionLaunchServiceTest.php`
- `tests/Feature/Modules/Delivery/API/SessionLaunchFeatureTest.php`

## Files Modified
- `routes/api.php`
- `routes/modules/delivery.php`
- `implementation_plan_sprint06_phase03.md`

## Migration Added
**`alter_assessment_sessions_make_snapshot_nullable`**
Successfully converted the `assessment_snapshot_id` column in `assessment_sessions` from `NOT NULL` to `NULLABLE`. This resolved the schema conflict and enables the correct business workflow (creating DRAFT sessions prior to generating the Launch Snapshot). The migration supports full reversibility via the `down()` method.

## Business Logic Implemented
The Session Launch Engine securely bridges the Assessment definition lifecycle to the Delivery execution lifecycle. It separates the intention to execute (`createSession()`) from the actual execution lock (`launchSession()`). Upon launch, it generates an exhaustive snapshot capturing the entire blueprint hierarchy, persists it immutably, and generates an attempt mapped exclusively to that snapshot. 

## Session State Machine
A rigid State Machine has been enforced via `SessionStateMachine`:
- **Allowed**: `DRAFT` -> `LAUNCHED`, `DRAFT` -> `CANCELLED`
- **Idempotent**: `LAUNCHED` -> `LAUNCHED`, `CANCELLED` -> `CANCELLED` (ensures safe API retries)
- **Denied**: `LAUNCHED` -> `DRAFT`, `LAUNCHED` -> `CANCELLED`, `CANCELLED` -> `DRAFT`, `CANCELLED` -> `LAUNCHED`

## Snapshot Strategy
`SnapshotGenerationService` eager loads the complete schema (Blueprint -> Sections -> Questions -> Options & Competencies) to avoid N+1 querying. The entire payload, along with scoring, rules, and passing thresholds, is serialized into `snapshot_json` guaranteeing complete self-sufficiency for future Delivery engines (Timer, Randomization, Scoring).

## Immutability Strategy & Hash Strategy
A robust immutability lock is placed using cryptographic hashing. `SnapshotGenerationService` automatically calculates an SHA-256 hash (`snapshot_hash`) of the generated `snapshot_json`. Both are persisted. Attempt creations uniquely bind to this specific Snapshot ID, assuring that any subsequent mutations to the live `Assessment` or `Blueprint` models have zero impact on the execution context of the candidate.

## Security Findings
- **Tenant Isolation**: Services unconditionally require explicit `$organizationId` propagation. Cross-tenant launch attempts are structurally denied via implicit Repository where clauses.
- **DTO Safety**: DTOs strictly transmit UUID strings (e.g., `sessionUuid`, `attemptUuid`, `snapshotUuid`) shielding internal primary keys from external consumers.

## Audit Findings
- **Missing Session Audit Infrastructure**: Verified the absence of native `SessionAudit` or `SnapshotAudit` tables within the existing architecture. No fake components or arbitrary logging were created, documenting the gap strictly per requirements.

## Repository Findings
- To guarantee safe concurrency when launching, `SessionLaunchService` applies `lockForUpdate()` during the Session retrieval phase inside the `DB::transaction()` block.

## API Changes
Reconfigured OpenAPI specifications dynamically mapping Delivery routes strictly to the root `/api/v1/sessions/...` decoupled from any redundant `/delivery` prefixes.
- `POST /api/v1/sessions`
- `POST /api/v1/sessions/{session_uuid}/launch`
- `GET /api/v1/sessions/{session_uuid}`

## Tests Added
Extensive test coverage handles the immutable workflow constraints:
- Nullable schema validations.
- State machine rules and idempotent replay safety.
- Hash generation verification and immutability checking.
- Session creation validations (denying draft assessments or missing candidates).
- Transaction rollback safety.

## Acceptance Criteria Verification
- [x] Schema constraint resolved via reversible migration.
- [x] Session lifecycle mapped perfectly (`DRAFT` -> `LAUNCHED`).
- [x] Snapshot generation strictly deferred until Launch phase.
- [x] Payload extensively expanded to support Scoring/Randomization future steps.
- [x] Attempt created ONLY post-snapshot persistence in `CREATED` state.

## Known Risks
- **Snapshot Storage Volume**: The `snapshot_json` column stores massive LONGTEXT payloads. Given thousands of concurrent candidate launches, the `assessment_snapshots` table will grow exponentially. Future sprints should explore payload offloading to object storage (e.g., S3) or utilizing native JSON column optimization on MySQL/Postgres.

## Final Verdict
Sprint 06 Phase 3 **Session Launch Engine** is seamlessly established. The critical objective to guarantee absolute assessment execution immutability through deferred cryptographic snapshotting is fully achieved. The API contract strictly adheres to OpenAPI standards while reinforcing ironclad transactional and tenant boundaries.
