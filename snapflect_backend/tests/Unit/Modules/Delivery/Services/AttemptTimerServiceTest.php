<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Services;

use Tests\TestCase;
use App\Modules\Delivery\Services\AttemptTimerService;
use App\Modules\Delivery\Helpers\TimerPolicyHelper;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Delivery\Exceptions\TimerExpiredException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Config;
use Carbon\Carbon;
use Exception;

class AttemptTimerServiceTest extends TestCase
{
    use RefreshDatabase;

    private AttemptTimerService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AttemptTimerService(new TimerPolicyHelper());
        Config::set('assessment.grace_period_seconds', 0); // default to 0
    }

    private function createAttempt(?int $orgId = null, ?int $userId = null, ?Carbon $startedAt = null, ?Carbon $expiresAt = null, string $status = 'CREATED'): AssessmentAttempt
    {
        \Illuminate\Support\Facades\DB::statement('PRAGMA foreign_keys = OFF;');

        $attempt = new AssessmentAttempt();
        $attempt->uuid                  = Str::uuid()->toString();
        $attempt->organization_id       = $orgId ?? 1;
        $attempt->assessment_session_id = 1;
        $attempt->assessment_id         = 1;
        $attempt->assessment_version_id = 1;
        $attempt->assessment_snapshot_id = 1;
        $attempt->candidate_user_id     = $userId ?? 1;
        $attempt->status                = $status;
        $attempt->started_at            = $startedAt;
        $attempt->expires_at            = $expiresAt;
        $attempt->save();

        \Illuminate\Support\Facades\DB::statement('PRAGMA foreign_keys = ON;');

        return $attempt;
    }

    public function test_attempt_not_started_throws_exception()
    {
        $attempt = $this->createAttempt();

        $this->expectException(TimerExpiredException::class);
        $this->expectExceptionMessage('The attempt timer has not been started yet.');
        
        $this->service->evaluateAndGetStatus($attempt->uuid, 1, 1);
    }

    public function test_cross_tenant_denial()
    {
        $attempt = $this->createAttempt(1, 1, Carbon::now(), Carbon::now()->addMinutes(60), 'STARTED');

        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Attempt not found or access denied.');

        // Try to access with org 2
        $this->service->evaluateAndGetStatus($attempt->uuid, 2, 1);
    }

    public function test_valid_timer_calculation()
    {
        Carbon::setTestNow(Carbon::create(2026, 6, 22, 10, 0, 0, 'UTC'));

        $attempt = $this->createAttempt(1, 1, Carbon::now(), Carbon::now()->addMinutes(60), 'STARTED');

        $status = $this->service->evaluateAndGetStatus($attempt->uuid, 1, 1);

        $this->assertEquals(3600, $status->remainingSeconds);
        $this->assertFalse($status->expired);
        $this->assertFalse($status->withinGracePeriod);
        $this->assertEquals('STARTED', $status->currentState);
    }

    public function test_expiration_boundary_exact_second()
    {
        // 10:00:00 start, expires 11:00:00
        $startedAt = Carbon::create(2026, 6, 22, 10, 0, 0, 'UTC');
        $expiresAt = Carbon::create(2026, 6, 22, 11, 0, 0, 'UTC');
        $attempt = $this->createAttempt(1, 1, $startedAt, $expiresAt, 'STARTED');

        // Fast forward to exactly 11:00:00
        Carbon::setTestNow($expiresAt);

        $status = $this->service->evaluateAndGetStatus($attempt->uuid, 1, 1);

        $this->assertEquals(0, $status->remainingSeconds);
        $this->assertFalse($status->expired); // Exactly 0 means not expired yet (diffInSeconds returns 0, remainingSeconds() < 0 is expired)
    }

    public function test_one_second_after_expiration()
    {
        $startedAt = Carbon::create(2026, 6, 22, 10, 0, 0, 'UTC');
        $expiresAt = Carbon::create(2026, 6, 22, 11, 0, 0, 'UTC');
        $attempt = $this->createAttempt(1, 1, $startedAt, $expiresAt, 'STARTED');

        // Fast forward to exactly 11:00:01
        Carbon::setTestNow(Carbon::create(2026, 6, 22, 11, 0, 1, 'UTC'));

        $status = $this->service->evaluateAndGetStatus($attempt->uuid, 1, 1);

        // Status should be EXPIRED now
        $this->assertEquals(0, $status->remainingSeconds); // DTO masks negative to 0
        $this->assertTrue($status->expired);
        $this->assertEquals('EXPIRED', $status->currentState);
        
        // Assert DB was updated
        $this->assertDatabaseHas('assessment_attempts', [
            'id' => $attempt->id,
            'status' => 'EXPIRED'
        ]);
    }

    public function test_grace_period_enabled()
    {
        Config::set('assessment.grace_period_seconds', 60);

        $startedAt = Carbon::create(2026, 6, 22, 10, 0, 0, 'UTC');
        $expiresAt = Carbon::create(2026, 6, 22, 11, 0, 0, 'UTC');
        $attempt = $this->createAttempt(1, 1, $startedAt, $expiresAt, 'STARTED');

        // Fast forward to 11:00:30 (30 seconds overrun)
        Carbon::setTestNow(Carbon::create(2026, 6, 22, 11, 0, 30, 'UTC'));

        $status = $this->service->evaluateAndGetStatus($attempt->uuid, 1, 1);

        // Expired is true, but withinGracePeriod is true. It allows continuation.
        $this->assertTrue($status->expired);
        $this->assertTrue($status->withinGracePeriod);
        $this->assertEquals('STARTED', $status->currentState); // Status does NOT flip to EXPIRED because they can continue!
    }

    public function test_grace_period_exceeded()
    {
        Config::set('assessment.grace_period_seconds', 60);

        $startedAt = Carbon::create(2026, 6, 22, 10, 0, 0, 'UTC');
        $expiresAt = Carbon::create(2026, 6, 22, 11, 0, 0, 'UTC');
        $attempt = $this->createAttempt(1, 1, $startedAt, $expiresAt, 'STARTED');

        // Fast forward to 11:01:01 (61 seconds overrun)
        Carbon::setTestNow(Carbon::create(2026, 6, 22, 11, 1, 1, 'UTC'));

        $status = $this->service->evaluateAndGetStatus($attempt->uuid, 1, 1);

        $this->assertTrue($status->expired);
        $this->assertFalse($status->withinGracePeriod);
        $this->assertEquals('EXPIRED', $status->currentState); // Locked out.
    }

    public function test_already_expired_idempotent()
    {
        $startedAt = Carbon::create(2026, 6, 22, 10, 0, 0, 'UTC');
        $expiresAt = Carbon::create(2026, 6, 22, 11, 0, 0, 'UTC');
        $attempt = $this->createAttempt(1, 1, $startedAt, $expiresAt, 'EXPIRED');

        // Even if we evaluate again, it shouldn't hit the DB again if already EXPIRED.
        $status = $this->service->evaluateAndGetStatus($attempt->uuid, 1, 1);

        $this->assertEquals('EXPIRED', $status->currentState);
    }
}
