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

class AssessmentPublicationServiceTest extends TestCase
{
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

    public function test_state_machine_mutability()
    {
        $this->assertTrue(PublicationStateMachine::isMutable('DRAFT'));
        $this->assertTrue(PublicationStateMachine::isMutable('READY'));
        $this->assertFalse(PublicationStateMachine::isMutable('PUBLISHED'));
        $this->assertFalse(PublicationStateMachine::isMutable('ARCHIVED'));
    }

    public function test_fails_on_tenant_mismatch()
    {
        $this->setupRepositoryMock(null);

        $this->expectException(AssessmentPublicationException::class);
        $this->expectExceptionMessage('Assessment not found or access denied.');
        
        $this->service->makeReady('uuid-1', 999, 1);
    }

    public function test_idempotent_ready_transition()
    {
        $assessment = new Assessment(['current_state' => 'READY']);
        $this->setupRepositoryMock($assessment);

        $result = $this->service->makeReady('uuid-1', 1, 1);
        $this->assertEquals('READY', $result->currentStatus);
        $this->assertEquals('READY', $result->previousStatus);
    }

    public function test_draft_to_ready_denied_when_validation_fails()
    {
        $assessment = new Assessment(['current_state' => 'DRAFT', 'id' => 1]);
        $this->setupRepositoryMock($assessment);

        $this->validationServiceMock->shouldReceive('validate')
            ->once()
            ->andReturn(new ValidationResultDto('uuid-1', false, false, [], Carbon::now()->toIso8601String()));

        $this->expectException(AssessmentPublicationException::class);
        $this->expectExceptionMessage('Assessment failed validation and cannot be marked as READY.');

        $this->service->makeReady('uuid-1', 1, 1);
    }

    public function test_draft_to_ready_success()
    {
        $assessment = new Assessment(['current_state' => 'DRAFT', 'id' => 1]);
        $this->setupRepositoryMock($assessment);

        $this->validationServiceMock->shouldReceive('validate')
            ->once()
            ->andReturn(new ValidationResultDto('uuid-1', true, true, [], Carbon::now()->toIso8601String()));

        $result = $this->service->makeReady('uuid-1', 1, 1);
        
        $this->assertEquals('READY', $result->currentStatus);
        $this->assertEquals('DRAFT', $result->previousStatus);
    }

    public function test_ready_to_publish_denied_when_revalidation_fails()
    {
        $assessment = new Assessment(['current_state' => 'READY', 'id' => 1]);
        $this->setupRepositoryMock($assessment);

        // Simulated scenario: Assessment became invalid after being marked READY
        $this->validationServiceMock->shouldReceive('validate')
            ->once()
            ->andReturn(new ValidationResultDto('uuid-1', false, false, [], Carbon::now()->toIso8601String()));

        $this->expectException(AssessmentPublicationException::class);
        $this->expectExceptionMessage('Assessment validation failed during publish attempt.');

        $this->service->publish('uuid-1', 1, 1);
    }

    public function test_ready_to_publish_success()
    {
        $assessment = new Assessment(['current_state' => 'READY', 'id' => 1]);
        $this->setupRepositoryMock($assessment);

        $this->validationServiceMock->shouldReceive('validate')
            ->once()
            ->andReturn(new ValidationResultDto('uuid-1', true, true, [], Carbon::now()->toIso8601String()));

        $result = $this->service->publish('uuid-1', 1, 1);
        
        $this->assertEquals('PUBLISHED', $result->currentStatus);
        $this->assertEquals('READY', $result->previousStatus);
    }

    public function test_published_to_draft_denied()
    {
        $assessment = new Assessment(['current_state' => 'PUBLISHED', 'id' => 1]);
        $this->setupRepositoryMock($assessment);

        $this->expectException(AssessmentPublicationException::class);
        
        $this->service->makeReady('uuid-1', 1, 1);
    }

    public function test_published_to_archived_success()
    {
        $assessment = new Assessment(['current_state' => 'PUBLISHED', 'id' => 1]);
        $this->setupRepositoryMock($assessment);

        $result = $this->service->archive('uuid-1', 1, 1);
        
        $this->assertEquals('ARCHIVED', $result->currentStatus);
        $this->assertEquals('PUBLISHED', $result->previousStatus);
    }

    public function test_archived_to_published_denied()
    {
        $assessment = new Assessment(['current_state' => 'ARCHIVED', 'id' => 1]);
        $this->setupRepositoryMock($assessment);

        $this->expectException(AssessmentPublicationException::class);
        
        $this->service->publish('uuid-1', 1, 1);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
