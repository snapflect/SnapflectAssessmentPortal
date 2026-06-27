# Sprint 06 Phase 4: Randomization Engine

## Files Created
- `database/migrations/2026_06_22_000001_alter_assessment_attempts_add_randomization.php`
- `database/migrations/2026_06_22_000002_alter_assessment_snapshots_add_schema_version.php`
- `app/Modules/Delivery/DTOs/RandomizationResultDto.php`
- `app/Modules/Delivery/Exceptions/RandomizationException.php`
- `app/Modules/Delivery/Services/SeedGenerationService.php`
- `app/Modules/Delivery/Services/QuestionRandomizationService.php`
- `app/Modules/Delivery/Services/OptionRandomizationService.php`
- `app/Modules/Delivery/Services/RandomizationEngineService.php`
- `tests/Unit/Modules/Delivery/Services/RandomizationEngineServiceTest.php`

## Files Modified
- `app/Modules/Assessment/Services/SnapshotGenerationService.php`
- `app/Modules/Delivery/Services/AttemptCreationService.php`
- `app/Modules/Delivery/Services/SessionLaunchService.php`
- `app/Modules/Delivery/Resources/LaunchResultResource.php`
- `tests/Feature/Modules/Delivery/API/SessionLaunchFeatureTest.php`
- `implementation_plan_sprint06_phase04.md`

## Migrations Added
1. **`alter_assessment_attempts_add_randomization`**: Appended `randomization_seed`, `question_order_json`, and `option_order_json` columns to persist randomization outputs safely within the attempt execution layer.
2. **`alter_assessment_snapshots_add_schema_version`**: Added `snapshot_schema_version` to support version compatibility mapping across future execution engines.

## Business Logic Implemented
The Randomization Engine was successfully constructed per strict immutability and absolute determinism protocols. Randomization evaluates solely upon Snapshot data preventing candidate corruption by live Assessment mutation, completing prior to Attempt creation to ensure no attempt ever exists detached from a randomized state.

## Deterministic Hash Strategy & Seed Strategy
Randomization intentionally omits traditional PRNG routines (e.g. `mt_srand()`, `shuffle()`).
- **Seed Creation**: An explicit, repeatable seed is synthesized via `SHA256(Assessment UUID + Candidate UUID + Session UUID)`.
- **Question Ordering**: Uses deterministic sorting against a computed hash per item: `SHA256(Seed + Question UUID)`.
- **Option Ordering**: Same deterministic mechanism utilizing `SHA256(Seed + Question UUID + Option UUID)`.
This strictly ensures order mapping behaves identically, invariant of hosting environments or underlying library upgrades.

## Immutability Strategy
1. **Pipeline Execution Order**: Workflow enforces execution sequentially: Generate Snapshot -> Randomize -> Create Attempt.
2. **Immutable Replay**: If `launchSession` invokes a retry, the engine skips recalculations entirely, deferring to the exact JSON models safely nested within the pre-existing Attempt. Any forceful request to override throws `RandomizationException::alreadyRandomized()`. 

## Snapshot Versioning Changes
Modified `SnapshotGenerationService` internally. As snapshots generate, the system proactively locks in `snapshot_schema_version = '1.0'`. Future extensions processing legacy snapshots can decode structural variations seamlessly using this anchor without schema migrations impacting existing data sets.

## Security & API Findings
- Validated that NO randomizer REST endpoints have been implemented. The OpenAPI specifications confirmed randomization is strictly an internal engine module. Thus, no controllers were exposed, satisfying the "Do NOT invent public APIs" mandate.
- All engine mechanisms demand rigorous `$organizationId` propagation avoiding cross-tenant interference.

## Audit Findings
Investigated the delivery schema; native `RandomizationAudit` logging tools remain explicitly absent. Gap is effectively documented herein. Zero arbitrary or temporary logging infrastructures were initiated. 

## Tests Added
Extensive coverage incorporated within `RandomizationEngineServiceTest` validating hash fidelity:
- Confirmed deterministic `seed -> order` consistency.
- Verified that entirely distinct hashes manifest per separate UUID injections.
- Confirmed precision metadata immutability—guaranteeing correctly mapped items (e.g. `is_correct` options) survive the randomization permutation securely and flawlessly.

## Acceptance Criteria Verification
- [x] Removed unstable PRNG functions.
- [x] Restructured Launch Pipeline: Snapshot -> Randomization -> Attempt.
- [x] Confirmed Option structural metadata persistence post-shuffle.
- [x] Implemented irreversible deterministic Seed + Item Hashing.
- [x] Verified missing OpenAPI definition prohibiting REST endpoints.

## Known Risks
- Generating deterministic hashes dynamically during massive cohort onboarding phases may present microsecond latency spikes for multi-section complex assessments. If traffic demands exceed memory CPU availability, caching algorithms for standard un-randomized JSON fragments should be explored in future milestones.

## Final Verdict
Sprint 06 Phase 4 **Randomization Engine** successfully engineered. Pure algorithmic determinism replaces unpredictable library shuffles, perfectly guarding execution integrity across execution boundaries. All corrections have been flawlessly verified and integrated into the `launchSession` operational state machine.
