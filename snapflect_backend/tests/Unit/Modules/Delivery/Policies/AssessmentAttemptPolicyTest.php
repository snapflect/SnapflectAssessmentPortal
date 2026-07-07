<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Policies;

use Tests\TestCase;
use App\Modules\Security\Models\User;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Delivery\Policies\AssessmentAttemptPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class AssessmentAttemptPolicyTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_cross_tenant_access_denied(): void
    {
        $user = Mockery::mock(User::class)->makePartial();
        $user->organization_id = 1;
        $user->shouldReceive('hasRole')->with('PLATFORM_ADMIN')->andReturn(false);

        $attempt = new AssessmentAttempt();
        $attempt->organization_id = 2;

        $policy = new AssessmentAttemptPolicy();
        $this->assertFalse($policy->view($user, $attempt));
    }

    public function test_candidate_cannot_access_other_attempt(): void
    {
        $user = Mockery::mock(User::class)->makePartial();
        $user->id = 1;
        $user->organization_id = 1;
        $user->shouldReceive('hasRole')->with('PLATFORM_ADMIN')->andReturn(false);
        $user->shouldReceive('hasRole')->with('CANDIDATE')->andReturn(true);

        $attempt = new AssessmentAttempt();
        $attempt->organization_id = 1;
        $attempt->candidate_user_id = 2;

        $policy = new AssessmentAttemptPolicy();
        $this->assertFalse($policy->view($user, $attempt));
    }

    public function test_platform_admin_override(): void
    {
        $user = Mockery::mock(User::class)->makePartial();
        $user->shouldReceive('hasRole')->with('PLATFORM_ADMIN')->andReturn(true);

        $policy = new AssessmentAttemptPolicy();
        
        $this->assertTrue($policy->before($user, 'view'));
    }

    public function test_locked_attempt_denies_submit(): void
    {
        $user = Mockery::mock(User::class)->makePartial();
        $user->id = 1;
        $user->organization_id = 1;
        $user->shouldReceive('hasRole')->with('PLATFORM_ADMIN')->andReturn(false);
        $user->shouldReceive('hasRole')->with('CANDIDATE')->andReturn(true);

        $attempt = new AssessmentAttempt();
        $attempt->organization_id = 1;
        $attempt->candidate_user_id = 1;
        $attempt->status = 'LOCKED';

        $policy = new AssessmentAttemptPolicy();
        $this->assertFalse($policy->submit($user, $attempt));
    }
}
