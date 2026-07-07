<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Modules\Assessment\Services\PublishingService;
use App\Modules\Assessment\Repositories\Interfaces\AssessmentRepositoryInterface;
use App\Modules\Assessment\Repositories\Interfaces\PublicationRepositoryInterface;
use App\Modules\Assessment\Services\AssessmentSnapshotService;
use App\Modules\Assessment\Services\VersionService;
use App\Modules\Assessment\DTOs\PublishAssessmentDto;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use Mockery;

class PublishingServiceTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $service;
    protected $assessmentRepoMock;
    protected $publicationRepoMock;
    protected $snapshotServiceMock;
    protected $versionServiceMock;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->assessmentRepoMock = Mockery::mock(AssessmentRepositoryInterface::class);
        $this->publicationRepoMock = Mockery::mock(PublicationRepositoryInterface::class);
        $this->snapshotServiceMock = Mockery::mock(AssessmentSnapshotService::class);
        $this->versionServiceMock = Mockery::mock(VersionService::class);

        $this->service = new PublishingService(
            $this->assessmentRepoMock,
            $this->publicationRepoMock,
            $this->snapshotServiceMock,
            $this->versionServiceMock
        );
    }

    public function test_publication_workflow()
    {
        $dto = new PublishAssessmentDto('test-uuid', 'Notes');
        
        $assessment = new class extends Model {
            protected $attributes = ['id' => 1, 'current_state' => 'IN_REVIEW'];
        };

        $this->assessmentRepoMock->shouldReceive('findByUuid')->with('test-uuid')->andReturn($assessment);
        $this->assessmentRepoMock->shouldReceive('update')->with(1, Mockery::any())->andReturn(true);
        
        $version = clone $assessment;
        $this->versionServiceMock->shouldReceive('lockVersion')->with(1)->andReturn($version);
        
        $snapshot = clone $assessment;
        $this->snapshotServiceMock->shouldReceive('createSnapshot')->with(1, 1, 1)->andReturn($snapshot);
        
        $publication = Mockery::mock(Model::class);
        $publication->shouldReceive('toArray')->andReturn(['id' => 1]);
        $this->publicationRepoMock->shouldReceive('create')->with(Mockery::any())->andReturn($publication);

        


        $result = $this->service->publish($dto, 1);
        
        $this->assertIsArray($result);
        $this->assertEquals(['id' => 1], $result);
    }

    public function test_draft_to_review_to_publish()
    {
        $dto = new PublishAssessmentDto('test-uuid', 'Notes');
        
        $assessment = new class extends Model {
            protected $attributes = ['id' => 1, 'current_state' => 'DRAFT'];
        };

        $this->assessmentRepoMock->shouldReceive('findByUuid')->with('test-uuid')->andReturn($assessment);

        


        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('State Transition Forbidden. Assessment must be IN_REVIEW to be PUBLISHED.');

        $this->service->publish($dto, 1);
    }
}
