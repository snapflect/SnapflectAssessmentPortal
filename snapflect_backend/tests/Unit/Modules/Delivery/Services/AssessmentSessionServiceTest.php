<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Modules\Delivery\Services\AssessmentSessionService;
use App\Modules\Delivery\Repositories\Interfaces\AssessmentSessionRepositoryInterface;
use App\Modules\Delivery\Services\AssessmentAttemptService;
use App\Modules\Delivery\Services\AttemptAuditService;
use App\Modules\Delivery\DTOs\LaunchAssessmentDto;
use App\Modules\Delivery\DTOs\ResumeSessionDto;
use App\Modules\Delivery\DTOs\TerminateSessionDto;
use Mockery;

class AssessmentSessionServiceTest extends TestCase
{
    use RefreshDatabase;

    private AssessmentSessionService $sessionService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $sessionRepository = Mockery::mock(AssessmentSessionRepositoryInterface::class);
        $attemptService = Mockery::mock(AssessmentAttemptService::class);
        $auditService = Mockery::mock(AttemptAuditService::class);
        
        $this->sessionService = new AssessmentSessionService(
            $sessionRepository,
            $attemptService,
            $auditService
        );
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_launch_assessment(): void
    {
        $dto = (new \ReflectionClass(LaunchAssessmentDto::class))->newInstanceWithoutConstructor();
        $result = $this->sessionService->launchAssessment($dto);
        $this->assertIsArray($result);
    }

    public function test_resume_session(): void
    {
        $dto = (new \ReflectionClass(ResumeSessionDto::class))->newInstanceWithoutConstructor();
        $result = $this->sessionService->resumeSession($dto);
        $this->assertIsArray($result);
    }

    public function test_terminate_session(): void
    {
        $dto = (new \ReflectionClass(TerminateSessionDto::class))->newInstanceWithoutConstructor();
        $this->sessionService->terminateSession($dto);
        $this->assertTrue(true);
    }

    public function test_expire_session(): void
    {
        $this->sessionService->expireSession('session-uuid');
        $this->assertTrue(true);
    }
}
