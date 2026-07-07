<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Policies;

use Tests\TestCase;
use App\Modules\Security\Models\User;
use App\Modules\Delivery\Models\AssessmentSession;
use App\Modules\Delivery\Policies\AssessmentSessionPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class AssessmentSessionPolicyTest extends TestCase
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

        $session = new AssessmentSession();
        $session->organization_id = 2;

        $policy = new AssessmentSessionPolicy();
        $this->assertFalse($policy->view($user, $session));
    }

    public function test_platform_admin_override(): void
    {
        $user = Mockery::mock(User::class)->makePartial();
        $user->shouldReceive('hasRole')->with('PLATFORM_ADMIN')->andReturn(true);

        $policy = new AssessmentSessionPolicy();
        
        $this->assertTrue($policy->before($user, 'view'));
    }

    public function test_candidate_can_view_own_session(): void
    {
        $user = Mockery::mock(User::class)->makePartial();
        $user->id = 1;
        $user->organization_id = 1;
        $user->shouldReceive('hasRole')->with('PLATFORM_ADMIN')->andReturn(false);
        $user->shouldReceive('hasRole')->with('CANDIDATE')->andReturn(true);

        $session = new AssessmentSession();
        $session->organization_id = 1;
        $session->candidate_user_id = 1;

        $policy = new AssessmentSessionPolicy();
        $this->assertTrue($policy->view($user, $session));
    }
}
