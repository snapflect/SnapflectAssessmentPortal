<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Policies;

use Tests\TestCase;
use App\Modules\Security\Models\User;
use App\Modules\Delivery\Models\AttemptSubmission;
use App\Modules\Delivery\Policies\AttemptSubmissionPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class AttemptSubmissionPolicyTest extends TestCase
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

        $submission = new AttemptSubmission();
        $submission->organization_id = 2;

        $policy = new AttemptSubmissionPolicy();
        $this->assertFalse($policy->view($user, $submission));
    }

    public function test_candidate_can_view_own_submission(): void
    {
        $user = Mockery::mock(User::class)->makePartial();
        $user->id = 1;
        $user->organization_id = 1;
        $user->shouldReceive('hasRole')->with('PLATFORM_ADMIN')->andReturn(false);
        $user->shouldReceive('hasRole')->with('CANDIDATE')->andReturn(true);

        $submission = new AttemptSubmission();
        $submission->organization_id = 1;
        $submission->candidate_user_id = 1;

        $policy = new AttemptSubmissionPolicy();
        $this->assertTrue($policy->view($user, $submission));
    }

    public function test_platform_admin_override(): void
    {
        $user = Mockery::mock(User::class)->makePartial();
        $user->shouldReceive('hasRole')->with('PLATFORM_ADMIN')->andReturn(true);

        $policy = new AttemptSubmissionPolicy();
        
        $this->assertTrue($policy->before($user, 'view'));
    }
}
