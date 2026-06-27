# Sprint 06 Phase 4: Randomization Engine Implementation Plan

This plan details the implementation of the Randomization Engine, which operates strictly on immutable Assessment Snapshots to generate a seeded, deterministic, and repeatable random ordering for questions and options, ensuring execution integrity.

## User Review Required
No open questions. The plan strictly follows the deterministic seed strategy, immutability, and internal integration requirements as per the OpenAPI and Schema findings.

## Proposed Changes

### 1. Database Migrations
**`alter_assessment_attempts_add_randomization_fields`**
- Adds `randomization_seed` (string, nullable)
- Adds `question_order_json` (json, nullable)
- Adds `option_order_json` (json, nullable)
- To `assessment_attempts` table.

**`alter_assessment_snapshots_add_schema_version`**
- Adds `snapshot_schema_version` (string, default '1.0') to `assessment_snapshots` table.

*Note: Both migrations will be reversible with `down()` methods.*

### 2. DTOs and Exceptions
#### `app/Modules/Delivery/DTOs/RandomizationResultDto.php`
- `readonly class RandomizationResultDto`
- Fields: `attemptUuid`, `snapshotUuid`, `seed`, `questionRandomized`, `optionRandomized`, `randomizedAt`.

#### `app/Modules/Delivery/Exceptions/RandomizationException.php`
- Handles failures like `SEED_GENERATION_FAILED`, `RANDOMIZATION_FAILED`.

### 3. Services
#### `app/Modules/Delivery/Services/SeedGenerationService.php`
- `generate(string $assessmentUuid, string $candidateUuid, string $sessionUuid): string`
- Uses `hash('sha256', $assessmentUuid . $candidateUuid . $sessionUuid)` to generate a completely deterministic and environment-independent seed.

#### `app/Modules/Delivery/Services/QuestionRandomizationService.php`
- `randomize(array $snapshotQuestions, string $seed): array`
- Uses the deterministic seed to initialize a PRNG (e.g., `mt_srand(hexdec(substr($seed, 0, 8)))`).
- Shuffles the questions while preserving their structural integrity and weights.
- Returns a flat or structured map of the randomized ordering.

#### `app/Modules/Delivery/Services/OptionRandomizationService.php`
- `randomize(array $snapshotOptions, string $seed): array`
- Shuffles options for each question independently using the same seeded PRNG strategy.
- Preserves `is_correct` bindings exactly.

#### `app/Modules/Delivery/Services/RandomizationEngineService.php`
- Coordinates the engine.
- `execute(AssessmentAttempt $attempt, AssessmentSnapshot $snapshot, Assessment $assessment): RandomizationResultDto`
- Checks assessment rules to determine if Question/Option randomization is enabled.
- Invokes generators, serializes results to JSON, and updates the `$attempt`.

### 4. Integration into Session Launch Flow
- Modify `SessionLaunchService::launchSession` to inject the `RandomizationEngineService`.
- Flow: `Generate Snapshot` -> `Create Attempt` -> `Randomize (Seed -> Randomize -> Persist in Attempt)` -> Return result.
- All enclosed safely within the existing `DB::transaction()`.

### 5. API Design
- **Finding**: Searching the execution OpenAPI document revealed **NO** public endpoints for triggering Randomization.
- **Decision**: Per rules, the engine will remain purely internal. No `RandomizationController` or public API routes will be created.

### 6. Audit Findings
- No `RandomizationAudit` or `AttemptAudit` tables exist. Gap will be documented.

### 7. Automated Tests
#### `tests/Unit/Modules/Delivery/Services/RandomizationEngineServiceTest.php`
- Same seed -> same order.
- Different seed -> different order.
- Verify option correctness is preserved.
- Verify JSON ordering structure is valid and correctly persisted on Attempt creation.

## Verification Plan
- Run `php artisan test --filter RandomizationEngineServiceTest`
- Ensure all Launch tests still pass with Randomization integrated.
