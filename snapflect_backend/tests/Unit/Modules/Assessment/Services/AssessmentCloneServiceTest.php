<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Modules\Assessment\DTOs\CloneAssessmentDto;
use App\Modules\Assessment\Repositories\Interfaces\AssessmentRepositoryInterface;
use App\Modules\Assessment\Services\AssessmentCloneService;
use App\Modules\Assessment\Services\BlueprintService;
use Illuminate\Support\Facades\DB;
use Mockery;

class AssessmentCloneServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_clone_integrity()
    {

        $mockRepo = Mockery::mock(AssessmentRepositoryInterface::class);
        $mockBlueprintService = Mockery::mock(BlueprintService::class);

        $sourceAssessment = Mockery::mock(\Illuminate\Database\Eloquent\Model::class);
        $sourceAssessment->shouldReceive('getAttribute')->with('assessment_code')->andReturn('CODE123');
        $sourceAssessment->shouldReceive('toArray')->andReturn([
            'id' => 1,
            'uuid' => 'uuid-123',
            'assessment_code' => 'CODE123',
            'name' => 'Original',
        ]);

        $dto = new CloneAssessmentDto('uuid-123', null);

        $mockRepo->shouldReceive('findByUuid')
            ->once()
            ->with('uuid-123')
            ->andReturn($sourceAssessment);

        $sourceAssessment->shouldReceive('getAttribute')->with('id')->andReturn(1);
        $mockCreated = Mockery::mock(\Illuminate\Database\Eloquent\Model::class);
        $mockCreated->shouldReceive('getAttribute')->with('id')->andReturn(2);
        $mockCreated->shouldReceive('toArray')->andReturn(['id' => 2]);

        $mockRepo->shouldReceive('create')
            ->once()
            ->with(Mockery::on(function ($data) {
                return !isset($data['id']) &&
                       !isset($data['uuid']) &&
                       str_starts_with($data['assessment_code'], 'CODE123-COPY-') &&
                       $data['name'] === 'Original';
            }))
            ->andReturn($mockCreated);

        $mockBlueprintService->shouldReceive('cloneBlueprint')
            ->once()
            ->with(1, 2, 99);

        $service = new AssessmentCloneService($mockRepo, $mockBlueprintService);
        
        $result = $service->cloneAssessment($dto, 99);
        $this->assertEquals(['id' => 2], $result);
    }

    public function test_clone_creates_new_draft()
    {

        $mockRepo = Mockery::mock(AssessmentRepositoryInterface::class);
        $mockBlueprintService = Mockery::mock(BlueprintService::class);

        $sourceAssessment = Mockery::mock(\Illuminate\Database\Eloquent\Model::class);
        $sourceAssessment->shouldReceive('getAttribute')->with('assessment_code')->andReturn('TEST');
        $sourceAssessment->shouldReceive('toArray')->andReturn(['assessment_code' => 'TEST']);

        $dto = new CloneAssessmentDto('uuid-test', null);

        $mockRepo->shouldReceive('findByUuid')->andReturn($sourceAssessment);

        $sourceAssessment->shouldReceive('getAttribute')->with('id')->andReturn(1);
        $mockCreated = Mockery::mock(\Illuminate\Database\Eloquent\Model::class);
        $mockCreated->shouldReceive('getAttribute')->with('id')->andReturn(2);
        $mockCreated->shouldReceive('toArray')->andReturn(['id' => 2]);

        $mockRepo->shouldReceive('create')
            ->once()
            ->with(Mockery::on(function ($data) {
                return $data['current_state'] === 'DRAFT' &&
                       $data['is_published'] === false &&
                       $data['created_by'] === 101 &&
                       str_starts_with($data['assessment_code'], 'TEST-COPY-');
            }))
            ->andReturn($mockCreated);

        $mockBlueprintService->shouldReceive('cloneBlueprint')
            ->once()
            ->with(1, 2, 101);

        $service = new AssessmentCloneService($mockRepo, $mockBlueprintService);
        $service->cloneAssessment($dto, 101);
        
        $this->assertTrue(true);
    }
}
