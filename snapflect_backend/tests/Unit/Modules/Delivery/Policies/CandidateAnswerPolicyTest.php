<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Policies;

use Tests\TestCase;
use App\Modules\Security\Models\User;
use App\Modules\Delivery\Models\CandidateAnswer;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Delivery\Policies\CandidateAnswerPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class CandidateAnswerPolicyTest extends TestCase
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

        $answer = new CandidateAnswer();
        $answer->organization_id = 2;

        $policy = new CandidateAnswerPolicy();
        $this->assertFalse($policy->view($user, $answer));
    }

    public function test_candidate_cannot_access_other_answers(): void
    {
        $user = Mockery::mock(User::class)->makePartial();
        $user->id = 1;
        $user->organization_id = 1;
        $user->shouldReceive('hasRole')->with('PLATFORM_ADMIN')->andReturn(false);
        $user->shouldReceive('hasRole')->with('CANDIDATE')->andReturn(true);

        $attempt = new AssessmentAttempt();
        $attempt->candidate_user_id = 2;

        $answer = new CandidateAnswer();
        $answer->organization_id = 1;
        $answer->setRelation('attempt', $attempt);

        $policy = new CandidateAnswerPolicy();
        $this->assertFalse($policy->view($user, $answer));
    }

    public function test_locked_attempt_denies_update(): void
    {
        $user = Mockery::mock(User::class)->makePartial();
        $user->id = 1;
        $user->organization_id = 1;
        $user->shouldReceive('hasRole')->with('PLATFORM_ADMIN')->andReturn(false);
        $user->shouldReceive('hasRole')->with('CANDIDATE')->andReturn(true);

        $attempt = new AssessmentAttempt();
        $attempt->candidate_user_id = 1;
        $attempt->status = 'LOCKED';

        $answer = new CandidateAnswer();
        $answer->organization_id = 1;
        $answer->setRelation('attempt', $attempt);

        $policy = new CandidateAnswerPolicy();
        $this->assertFalse($policy->update($user, $answer));
    }

    public function test_platform_admin_override(): void
    {
        $user = Mockery::mock(User::class)->makePartial();
        $user->shouldReceive('hasRole')->with('PLATFORM_ADMIN')->andReturn(true);

        $policy = new CandidateAnswerPolicy();
        
        $this->assertTrue($policy->before($user, 'view'));
    }
}
