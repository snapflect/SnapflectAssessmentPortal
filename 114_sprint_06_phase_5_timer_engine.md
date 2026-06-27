# Sprint 06 Phase 5: Timer Engine

## Files Created
- `app/Modules/Delivery/DTOs/TimerStatusDto.php`
- `app/Modules/Delivery/Exceptions/TimerExpiredException.php`
- `app/Modules/Delivery/Helpers/TimerPolicyHelper.php`
- `app/Modules/Delivery/Services/AttemptTimerService.php`
- `tests/Unit/Modules/Delivery/Services/AttemptTimerServiceTest.php`

## Field Mapping Decision
As requested and verified, the Timer Engine was securely mapped to the pre-existing columns `started_at`, `expires_at`, and `status` natively living inside the `assessment_attempts` table. This strategy perfectly circumvented the need for redundant migrations or alterations to unrelated architectural structures.

## OpenAPI Contract Findings
The comprehensive evaluation confirmed that `GET /api/v1/attempts/{attempt_uuid}/timer` is **definitively absent** from the `106_ASSESSMENT_EXECUTION_OPENAPI_v1.0` master specification. Consequently, following strict compliance mandates, the Timer Engine was intentionally retained as a backend internal service. No public controllers or API endpoints were artificially invented to patch the gap.

## Authoritative Time Strategy
The engine utilizes pure `Carbon::now()` standard server time mechanisms. Client payloads, browser timestamps, and arbitrary REST payloads are comprehensively rejected. Any time calculation stems absolutely from `Carbon::now()->diffInSeconds($attempt->expires_at, false)`.

## Expiration Strategy & Idempotency
Expiration is heavily deterministic.
- If `canContinue()` fails dynamically, the Attempt triggers an `expireAttempt()` sequence enforcing an explicit `status = 'EXPIRED'`.
- Duplicate assessments of already `EXPIRED` attempts result in instantaneous no-ops bypassing database interaction, eliminating redundant transaction locks and database overhead.

## Grace Period Strategy
Extended flexibility via Grace Periods is mapped to standard `assessment.grace_period_seconds` config overrides. The system permits evaluation continuation post-expiration (where $remaining < 0$) exclusively up to the exact threshold allowed. If exceeded, rigid hard-locks are instated and `withinGracePeriod` dynamically flips to `false`.

## Policy Helper Design
To guarantee unified standardization for future phases (Auto-Save, Submission, Resume), all timer rules were centralized into `TimerPolicyHelper`. This grants downstream components robust $O(1)$ assessment algorithms (`canContinue()`, `isExpired()`, `remainingSeconds()`) avoiding fragmented and redundant date operations spread across execution engines.

## Security & Audit Findings
- **Security:** Data scopes forcefully encapsulate `$organizationId` and `$userId`, enforcing strict cross-tenant partitioning and shielding the module from direct URL parameter manipulation.
- **Audit Gaps:** No `AttemptAudit` or `TimerAudit` systems exist inside the repository context. Given the directive to avoid fake architecture, no placeholder tracking repositories were instantiated. The architectural gap remains documented here.

## Tests Added
A highly aggressive unit test matrix (`AttemptTimerServiceTest`) enforces exact edge-case boundaries:
- `test_valid_timer_calculation`: Accurate calculation mappings.
- `test_expiration_boundary_exact_second`: Exact boundary tolerance.
- `test_one_second_after_expiration`: Confirm lock triggers appropriately upon 1-second violation.
- `test_grace_period_enabled` / `exceeded`: Verifies flexible configuration leniency overrides.
- `test_already_expired_idempotent`: Guarantees safe retry executions without double inserts.
- `test_cross_tenant_denial`: Confirms repository leakage denial mapping.

## Known Risks
Without the explicit `Timer` API controller, the frontend relies entirely on WebSocket streaming updates or separate overarching Execution Endpoints to sync time. If the architecture assumes polling is necessary, the OpenAPI contract must be formally expanded in future sprints.

## Final Verdict
Sprint 06 Phase 5 **Timer Engine** successfully constructed. It achieves absolute zero client-trust functionality by mapping natively to robust UTC differentials mapped safely through pure internal services preventing unsanctioned endpoint disclosures.
