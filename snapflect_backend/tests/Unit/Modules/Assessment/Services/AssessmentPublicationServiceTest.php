<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Services;

use Tests\TestCase;
use App\Modules\Assessment\Services\AssessmentPublicationService;
use App\Modules\Assessment\Services\AssessmentValidationService;
use App\Modules\Assessment\Services\PublicationStateMachine;
use App\Modules\Assessment\Repositories\Interfaces\AssessmentRepositoryInterface;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Exceptions\AssessmentPublicationException;
use App\Modules\Assessment\DTOs\ValidationResultDto;
use Illuminate\Database\Eloquent\Builder;
use Mockery;
use Carbon\Carbon;

use Illuminate\Foundation\Testing\RefreshDatabase;

class AssessmentPublicationServiceTest extends TestCase
{
    use RefreshDatabase;

    private AssessmentPublicationService $service;
    private $repositoryMock;
    private $validationServiceMock;
    private $stateMachine;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repositoryMock = Mockery::mock(AssessmentRepositoryInterface::class);
        $this->validationServiceMock = Mockery::mock(AssessmentValidationService::class);
        $this->stateMachine = new PublicationStateMachine();

        $this->service = new AssessmentPublicationService(
            $this->repositoryMock,
            $this->validationServiceMock,
            $this->stateMachine
        );
    }

    private function setupRepositoryMock(Assessment $assessment = null)
    {
        $builderMock = Mockery::mock(Builder::class);
        $builderMock->shouldReceive('where')->andReturnSelf();
        $builderMock->shouldReceive('first')->andReturn($assessment);

        $this->repositoryMock->shouldReceive('query')->andReturn($builderMock);
        $this->repositoryMock->shouldReceive('update')->andReturn(true);
    }

    /** @test — isMutable: DRAFT and IN_REVIEW are mutable; PUBLISHED and ARCHIVED are not */
    public function test_state_machine_mutability()
    {
        $this->assertTrue(PublicationStateMachine::isMutable('DRAFT'));
        $this->assertTrue(PublicationStateMachine::isMutable('IN_REVIEW'));
        $this->assertTrue(PublicationStateMachine::isMutable('APPROVED'));
        $this->assertFalse(PublicationStateMachine::isMutable('PUBLISHED'));
        $this->assertFalse(PublicationStateMachine::isMutable('ARCHIVED'));
    }

    /** @test — makeReady throws when assessment is not found (tenant mismatch) */
    public function test_fails_on_tenant_mismatch()
    {
        $this->setupRepositoryMock(null);

        $this->expectException(AssessmentPublicationException::class);
        $this->expectExceptionMessage('Assessment not found or access denied.');

        $this->service->makeReady('uuid-1', 999, 1);
    }

    /** @test — APPROVED is idempotent (already in the target state) */
    public function test_idempotent_approved_transition()
    {
        $assessment = new Assessment(['current_state' => 'APPROVED']);
        $this->setupRepositoryMock($assessment);

        $result = $this->service->makeReady('uuid-1', 1, 1);
        $this->assertEquals('APPROVED', $result->currentStatus);
        $this->assertEquals('APPROVED', $result->previousStatus);
    }

    /** @test — DRAFT → APPROVED denied when validation fails */
    public function test_draft_to_approved_denied_when_validation_fails()
    {
        $assessment = new Assessment(['current_state' => 'DRAFT']);
        $assessment->id = 1;
        $this->setupRepositoryMock($assessment);

        $this->validationServiceMock->shouldReceive('validate')
            ->once()
            ->andReturn(new ValidationResultDto('uuid-1', false, false, [], Carbon::now()->toIso8601String()));

        $this->expectException(AssessmentPublicationException::class);
        $this->expectExceptionMessage('Assessment failed validation and cannot be approved.');

        $this->service->makeReady('uuid-1', 1, 1);
    }

    /** @test — DRAFT → APPROVED succeeds when valid */
    public function test_draft_to_approved_success()
    {
        $assessment = new Assessment(['current_state' => 'DRAFT']);
        $assessment->id = 1;
        $this->setupRepositoryMock($assessment);

        $this->validationServiceMock->shouldReceive('validate')
            ->once()
            ->andReturn(new ValidationResultDto('uuid-1', true, true, [], Carbon::now()->toIso8601String()));

        $result = $this->service->makeReady('uuid-1', 1, 1);

        $this->assertEquals('APPROVED', $result->currentStatus);
        $this->assertEquals('DRAFT', $result->previousStatus);
    }

    /** @test — APPROVED → PUBLISHED denied when re-validation fails */
    public function test_approved_to_published_denied_when_revalidation_fails()
    {
        $assessment = new Assessment(['current_state' => 'APPROVED']);
        $assessment->id = 1;
        $this->setupRepositoryMock($assessment);

        $this->validationServiceMock->shouldReceive('validate')
            ->once()
            ->andReturn(new ValidationResultDto('uuid-1', false, false, [], Carbon::now()->toIso8601String()));

        $this->expectException(AssessmentPublicationException::class);
        $this->expectExceptionMessage('Assessment validation failed');

        $schedulingData = [
            'publication_code' => 'PUB-001',
            'title' => 'Test Pub',
            'start_date' => Carbon::now()->toIso8601String(),
            'end_date' => Carbon::now()->addDays(7)->toIso8601String(),
            'max_attempts' => 1,
            'is_proctored' => false
        ];
        $this->service->publish('uuid-1', $schedulingData, 1, 1);
    }

    /** @test — APPROVED → PUBLISHED succeeds when valid */
    public function test_approved_to_published_success()
    {
        $assessment = new Assessment(['current_state' => 'APPROVED']);
        $assessment->id = 1;
        $this->setupRepositoryMock($assessment);

        $this->validationServiceMock->shouldReceive('validate')
            ->once()
            ->andReturn(new ValidationResultDto('uuid-1', true, true, [], Carbon::now()->toIso8601String()));

        $schedulingData = [
            'publication_code' => 'PUB-001',
            'title' => 'Test Pub',
            'start_date' => Carbon::now()->toIso8601String(),
            'end_date' => Carbon::now()->addDays(7)->toIso8601String(),
            'max_attempts' => 1,
            'is_proctored' => false
        ];
        $result = $this->service->publish('uuid-1', $schedulingData, 1, 1);

        $this->assertEquals('PUBLISHED', $result->currentStatus);
        $this->assertEquals('APPROVED', $result->previousStatus);
    }

    /** @test — PUBLISHED → DRAFT denied (cannot go backwards) */
    public function test_published_to_draft_denied()
    {
        $assessment = new Assessment(['current_state' => 'PUBLISHED']);
        $assessment->id = 1;
        $this->setupRepositoryMock($assessment);

        $this->expectException(AssessmentPublicationException::class);

        $this->service->makeReady('uuid-1', 1, 1);
    }

    /** @test — PUBLISHED → ARCHIVED succeeds */
    public function test_published_to_archived_success()
    {
        $assessment = new Assessment(['current_state' => 'PUBLISHED']);
        $assessment->id = 1;
        $this->setupRepositoryMock($assessment);

        $result = $this->service->archive('uuid-1', 1, 1);

        $this->assertEquals('ARCHIVED', $result->currentStatus);
        $this->assertEquals('PUBLISHED', $result->previousStatus);
    }

    /** @test — ARCHIVED → PUBLISHED denied */
    public function test_archived_to_published_denied()
    {
        $assessment = new Assessment(['current_state' => 'ARCHIVED']);
        $assessment->id = 1;
        $this->setupRepositoryMock($assessment);

        $this->expectException(AssessmentPublicationException::class);

        $schedulingData = [
            'publication_code' => 'PUB-001',
            'title' => 'Test Pub',
            'start_date' => Carbon::now()->toIso8601String(),
            'end_date' => Carbon::now()->addDays(7)->toIso8601String(),
            'max_attempts' => 1,
            'is_proctored' => false
        ];
        $this->service->publish('uuid-1', $schedulingData, 1, 1);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
