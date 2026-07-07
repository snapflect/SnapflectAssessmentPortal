<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Services;

use Tests\TestCase;
use App\Modules\Delivery\Services\SessionLaunchService;
use App\Modules\Delivery\Services\SessionStateMachine;
use App\Modules\Delivery\Services\AttemptCreationService;
use App\Modules\Assessment\Services\SnapshotGenerationService;
use App\Modules\Delivery\Models\AssessmentSession;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Security\Models\User;
use App\Modules\Delivery\Exceptions\SessionLaunchException;
use App\Modules\Assessment\Models\AssessmentSnapshot;
use App\Modules\Delivery\Models\AssessmentAttempt;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

class SessionLaunchServiceTest extends TestCase
{
    use RefreshDatabase;

    private SessionLaunchService $service;

    protected function setUp(): void
    {
        parent::setUp();
        
        $stateMachine = new SessionStateMachine();
        $snapshotService = new SnapshotGenerationService();
        $attemptService = new AttemptCreationService();
        
        $this->service = new SessionLaunchService(
            $stateMachine, 
            $snapshotService, 
            $this->app->make(\App\Modules\Delivery\Services\RandomizationEngineService::class), 
            $attemptService
        );
    }

    public function test_state_machine_transitions()
    {
        $stateMachine = new SessionStateMachine();
        
        $this->assertTrue($stateMachine->canTransition('DRAFT', 'LAUNCHED'));
        $this->assertTrue($stateMachine->canTransition('DRAFT', 'CANCELLED'));
        $this->assertTrue($stateMachine->canTransition('LAUNCHED', 'LAUNCHED')); // Idempotent
        $this->assertTrue($stateMachine->canTransition('CANCELLED', 'CANCELLED')); // Idempotent
        
        $this->assertTrue($stateMachine->canTransition('LAUNCHED', 'DRAFT') === false);
        $this->assertTrue($stateMachine->canTransition('LAUNCHED', 'CANCELLED'));
        $this->assertFalse($stateMachine->canTransition('CANCELLED', 'LAUNCHED'));
        $this->assertFalse($stateMachine->canTransition('CANCELLED', 'DRAFT'));
    }

    public function test_create_session_fails_if_assessment_not_published()
    {
        $orgId = 1;
        $userId = 1;

        $assessment = \App\Modules\Assessment\Models\Assessment::factory()->create([
            'organization_id' => $orgId,
            'is_published' => false,
            'current_state' => 'DRAFT'
        ]);

        $this->expectException(SessionLaunchException::class);
        $this->expectExceptionMessage('Cannot create session for non-published assessment.');

        $this->service->createSession($assessment->uuid, $userId, $orgId, $userId);
    }

    public function test_launch_session_fails_if_session_not_found_or_tenant_mismatch()
    {
        $this->expectException(SessionLaunchException::class);
        $this->expectExceptionMessage('Session not found or access denied.');

        $this->service->launchSession(Str::uuid()->toString(), 999, 1);
    }
}
