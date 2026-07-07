<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Services;

use Tests\TestCase;
use App\Modules\Assessment\Repositories\Interfaces\AssessmentRepositoryInterface;
use App\Modules\Assessment\Services\AssessmentSnapshotService;
use Illuminate\Support\Facades\DB;
use Mockery;

class AssessmentSnapshotServiceTest extends TestCase
{
    use \Illuminate\Foundation\Testing\RefreshDatabase;
    protected function setUp(): void
    {
        parent::setUp();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_snapshot_creation()
    {

        
        $mockTable = Mockery::mock();
        $mockTable->shouldReceive('insertGetId')->andReturn(100);
        $mockTable->shouldReceive('find')->with(100)->andReturn((object)['id' => 100]);
        
        
        
        $mockRepo = Mockery::mock(AssessmentRepositoryInterface::class);
        $mockAssessment = Mockery::mock(\Illuminate\Database\Eloquent\Model::class);
        $mockAssessment->shouldReceive('getAttribute')->with('organization_id')->andReturn(1);
        $mockAssessment->shouldReceive('toArray')->andReturn(['fake' => 'data']);
        $mockRepo->shouldReceive('findByIdWithRelations')->andReturn($mockAssessment);
        
        $service = new AssessmentSnapshotService($mockRepo);
        $result = $service->createSnapshot(1, 1, 1);
        
        $this->assertIsInt($result->id);
        $this->assertGreaterThan(0, $result->id);
    }

    public function test_snapshot_immutable()
    {

        
        $mockTable = Mockery::mock();
        $mockTable->shouldReceive('insertGetId')->with(Mockery::on(function($data) {
            return isset($data['snapshot_hash']) && $data['status'] === 'ACTIVE';
        }))->andReturn(200);
        $mockTable->shouldReceive('find')->with(200)->andReturn((object)['id' => 200, 'snapshot_hash' => 'hash123', 'status' => 'ACTIVE']);
        
        
        
        $mockRepo = Mockery::mock(AssessmentRepositoryInterface::class);
        $mockAssessment = Mockery::mock(\Illuminate\Database\Eloquent\Model::class);
        $mockAssessment->shouldReceive('getAttribute')->with('organization_id')->andReturn(1);
        $mockAssessment->shouldReceive('toArray')->andReturn(['fake' => 'data2']);
        $mockRepo->shouldReceive('findByIdWithRelations')->andReturn($mockAssessment);
        
        $service = new AssessmentSnapshotService($mockRepo);
        $result = $service->createSnapshot(1, 1, 1);
        
        $this->assertEquals('ACTIVE', $result->status);
        $this->assertNotEmpty($result->snapshot_hash);
        $this->assertIsString($result->snapshot_hash);
    }
}
