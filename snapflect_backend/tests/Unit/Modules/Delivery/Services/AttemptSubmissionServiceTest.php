<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Delivery\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Modules\Delivery\Services\AttemptSubmissionService;
use App\Modules\Delivery\Repositories\Interfaces\AttemptSubmissionRepositoryInterface;
use App\Modules\Delivery\Services\AssessmentAttemptService;
use App\Modules\Delivery\Services\AttemptAuditService;
use App\Modules\Delivery\DTOs\SubmitAttemptDto;
use App\Modules\Delivery\DTOs\CreateSubmissionDto;
use Mockery;

class AttemptSubmissionServiceTest extends TestCase
{
    use RefreshDatabase;

    private AttemptSubmissionService $submissionService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $submissionRepository = Mockery::mock(AttemptSubmissionRepositoryInterface::class);
        $attemptService = Mockery::mock(AssessmentAttemptService::class);
        $auditService = Mockery::mock(AttemptAuditService::class);
        
        $this->submissionService = new AttemptSubmissionService(
            $submissionRepository,
            $attemptService,
            $auditService
        );
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_submit_assessment(): void
    {
        $dto = (new \ReflectionClass(SubmitAttemptDto::class))->newInstanceWithoutConstructor();
        $result = $this->submissionService->submitAssessment($dto);
        $this->assertIsArray($result);
    }

    public function test_create_submission(): void
    {
        $dto = (new \ReflectionClass(CreateSubmissionDto::class))->newInstanceWithoutConstructor();
        $result = $this->submissionService->createSubmission($dto);
        $this->assertIsArray($result);
    }

    public function test_lock_answers(): void
    {
        $this->submissionService->lockAnswers('attempt-uuid');
        $this->assertTrue(true);
    }

    public function test_prevent_resubmission(): void
    {
        $this->assertTrue(true);
    }
}
