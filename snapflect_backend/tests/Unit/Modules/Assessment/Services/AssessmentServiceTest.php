<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Services;

use Tests\TestCase;
use App\Modules\Assessment\Services\AssessmentService;
use App\Modules\Assessment\Services\AssessmentValidationService;
use App\Modules\Assessment\Repositories\Interfaces\AssessmentRepositoryInterface;
use App\Modules\Assessment\Repositories\Interfaces\AssessmentCategoryRepositoryInterface;
use App\Modules\Assessment\Repositories\Interfaces\AssessmentTypeRepositoryInterface;
use App\Modules\Assessment\DTOs\CreateAssessmentDto;
use App\Modules\Assessment\DTOs\UpdateAssessmentDto;
use App\Modules\Assessment\DTOs\ValidationResultDto;
use App\Modules\Assessment\Services\PublicationStateMachine;
use Illuminate\Support\Facades\DB;
use Mockery;
use Illuminate\Support\Facades\Auth;

class AssessmentServiceTest extends TestCase
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

    public function test_transactions()
    {

        
        $mockRepo = Mockery::mock(AssessmentRepositoryInterface::class);
        $mockCatRepo = Mockery::mock(AssessmentCategoryRepositoryInterface::class);
        $mockTypeRepo = Mockery::mock(AssessmentTypeRepositoryInterface::class);
        $mockValService = Mockery::mock(AssessmentValidationService::class);
        
        $mockAssessment = Mockery::mock(\Illuminate\Database\Eloquent\Model::class);
        $mockAssessment->shouldReceive('getAttribute')->with('current_state')->andReturn('DRAFT');
        $mockRepo->shouldReceive('findById')->with(1)->andReturn($mockAssessment);
        $mockRepo->shouldReceive('delete')->with(1)->andReturn(true);
        
        $service = new AssessmentService($mockRepo, $mockCatRepo, $mockTypeRepo, $mockValService);
        
        $this->assertTrue($service->deleteAssessment(1));
    }

    public function test_state_machine_rules()
    {

        Auth::shouldReceive('id')->andReturn(1);
        
        $mockRepo = Mockery::mock(AssessmentRepositoryInterface::class);
        $mockCatRepo = Mockery::mock(AssessmentCategoryRepositoryInterface::class);
        $mockTypeRepo = Mockery::mock(AssessmentTypeRepositoryInterface::class);
        $mockValService = Mockery::mock(AssessmentValidationService::class);
        
        $mockAssessment = Mockery::mock(\Illuminate\Database\Eloquent\Model::class);
        $mockAssessment->shouldReceive('getAttribute')->with('current_state')->andReturn('DRAFT');
        $mockAssessment->shouldReceive('getAttribute')->with('uuid')->andReturn('u1');
        $mockAssessment->shouldReceive('getAttribute')->with('organization_id')->andReturn(1);
        $mockRepo->shouldReceive('findById')->with(1)->andReturn($mockAssessment);
        $mockValService->shouldReceive('validate')->andReturn(new ValidationResultDto('u1', true, true, [], 'now'));
        $mockRepo->shouldReceive('update')->with(1, ['current_state' => 'IN_REVIEW'])->andReturn(true);
        
        $service = new AssessmentService($mockRepo, $mockCatRepo, $mockTypeRepo, $mockValService);
        $this->assertTrue($service->submitForReview(1));
    }

    public function test_published_assessment_cannot_update()
    {

        
        $mockRepo = Mockery::mock(AssessmentRepositoryInterface::class);
        $mockCatRepo = Mockery::mock(AssessmentCategoryRepositoryInterface::class);
        $mockTypeRepo = Mockery::mock(AssessmentTypeRepositoryInterface::class);
        $mockValService = Mockery::mock(AssessmentValidationService::class);
        
        $mockAssessment = Mockery::mock(\Illuminate\Database\Eloquent\Model::class);
        $mockAssessment->shouldReceive('getAttribute')->with('current_state')->andReturn('PUBLISHED');
        $mockRepo->shouldReceive('findById')->with(1)->andReturn($mockAssessment);
        
        $service = new AssessmentService($mockRepo, $mockCatRepo, $mockTypeRepo, $mockValService);
        
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("Cannot update an assessment in its current state.");
        
        $service->updateAssessment(1, new UpdateAssessmentDto());
    }

    public function test_published_assessment_cannot_delete()
    {

        
        $mockRepo = Mockery::mock(AssessmentRepositoryInterface::class);
        $mockCatRepo = Mockery::mock(AssessmentCategoryRepositoryInterface::class);
        $mockTypeRepo = Mockery::mock(AssessmentTypeRepositoryInterface::class);
        $mockValService = Mockery::mock(AssessmentValidationService::class);
        
        $mockAssessment = Mockery::mock(\Illuminate\Database\Eloquent\Model::class);
        $mockAssessment->shouldReceive('getAttribute')->with('current_state')->andReturn('PUBLISHED');
        $mockRepo->shouldReceive('findById')->with(1)->andReturn($mockAssessment);
        
        $service = new AssessmentService($mockRepo, $mockCatRepo, $mockTypeRepo, $mockValService);
        
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("Cannot delete a published assessment.");
        
        $service->deleteAssessment(1);
    }
}
