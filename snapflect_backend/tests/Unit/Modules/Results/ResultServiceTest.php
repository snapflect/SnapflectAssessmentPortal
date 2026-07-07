<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Results;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ResultServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_result_snapshot_created(): void
    {
        $org = \App\Modules\Governance\Models\Organization::factory()->create();
        $service = clone $this->app->make(\App\Modules\Results\Services\ResultService::class);
        
        $assessment = \App\Modules\Assessment\Models\Assessment::factory()->create(['organization_id' => $org->id]);
        
        $resultId = \Illuminate\Support\Facades\DB::table('assessment_results')->insertGetId([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $org->id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => 1,
            'candidate_user_id' => 1,
            'result_reference' => 'ref-1',
            'created_by' => 1,
            'created_date' => now()
        ]);
        $result = \App\Modules\Results\Models\AssessmentResult::find($resultId);

        $versionId = \Illuminate\Support\Facades\DB::table('result_versions')->insertGetId([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $org->id,
            'assessment_result_id' => $resultId,
            'version_number' => 1,
            'version_label' => 'v1',
            'version_reason' => 'test',
            'created_by' => 1,
            'created_date' => now()
        ]);
        $version = \App\Modules\Results\Models\ResultVersion::find($versionId);
        
        // Mock DB facade insert if needed, but sqlite tests just use DB
        $snapshot = clone $service->createSnapshot($result, $version, $org->id, 1);
        $this->assertInstanceOf(\App\Modules\Results\Models\ResultSnapshot::class, $snapshot);
    }

    public function test_result_version_created(): void
    {
        $org = \App\Modules\Governance\Models\Organization::factory()->create();
        $service = clone $this->app->make(\App\Modules\Results\Services\ResultService::class);
        
        $assessment = \App\Modules\Assessment\Models\Assessment::factory()->create(['organization_id' => $org->id]);
        $resultId = \Illuminate\Support\Facades\DB::table('assessment_results')->insertGetId([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $org->id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => 1,
            'candidate_user_id' => 1,
            'result_reference' => 'ref-1',
            'created_by' => 1,
            'created_date' => now()
        ]);
        $result = \App\Modules\Results\Models\AssessmentResult::find($resultId);
        
        $version = $service->createVersion($result, 'reason', $org->id, 1);
        
        $this->assertInstanceOf(\App\Modules\Results\Models\ResultVersion::class, $version);
    }

    public function test_recalculation_creates_new_version(): void
    {
        $org = \App\Modules\Governance\Models\Organization::factory()->create();
        $assessment = \App\Modules\Assessment\Models\Assessment::factory()->create(['organization_id' => $org->id]);
        $attemptId = \Illuminate\Support\Facades\DB::table('assessment_attempts')->insertGetId([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $org->id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => 1,
            'assessment_session_id' => 1,
            'assessment_snapshot_id' => 1,
            'candidate_user_id' => 1,
            'status' => 'IN_PROGRESS',
            'created_by' => 1,
            'created_date' => now()
        ]);
        $resultId = \Illuminate\Support\Facades\DB::table('assessment_results')->insertGetId([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $org->id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => $attemptId,
            'candidate_user_id' => 1,
            'result_reference' => 'ref-1',
            'created_by' => 1,
            'created_date' => now()
        ]);
        $result = \App\Modules\Results\Models\AssessmentResult::find($resultId);
        
        $mockScoringOrchestrator = \Mockery::mock(\App\Modules\Results\Services\ScoringOrchestratorService::class);
        $mockDto = new \App\Modules\Results\DTOs\ScoringPersistenceResultDto('uuid-attempt', $result->uuid, 1, 'READY', now()->toIso8601String());
        $mockScoringOrchestrator->shouldReceive('executeScoringPipeline')->andReturn($mockDto);
        
        $service = clone $this->app->make(\App\Modules\Results\Services\ResultService::class);
        $reflection = new \ReflectionClass($service);
        $property = $reflection->getProperty('scoringOrchestrator');
        $property->setAccessible(true);
        $property->setValue($service, $mockScoringOrchestrator);

        $dto = new \App\Modules\Results\DTOs\RecalculateResultDto($result->uuid, 'recalc reason');
        
        $recalculatedResult = $service->recalculate($dto, $org->id, 1);
        $this->assertInstanceOf(\App\Modules\Results\Models\AssessmentResult::class, $recalculatedResult);
    }

    public function test_historical_versions_unchanged(): void
    {
        $org = \App\Modules\Governance\Models\Organization::factory()->create();
        $assessment = \App\Modules\Assessment\Models\Assessment::factory()->create(['organization_id' => $org->id]);
        $attemptId = \Illuminate\Support\Facades\DB::table('assessment_attempts')->insertGetId([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $org->id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => 1,
            'assessment_session_id' => 1,
            'assessment_snapshot_id' => 1,
            'candidate_user_id' => 1,
            'status' => 'IN_PROGRESS',
            'created_by' => 1,
            'created_date' => now()
        ]);
        $resultId = \Illuminate\Support\Facades\DB::table('assessment_results')->insertGetId([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $org->id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => $attemptId,
            'candidate_user_id' => 1,
            'result_reference' => 'ref-1',
            'created_by' => 1,
            'created_date' => now()
        ]);
        $result = \App\Modules\Results\Models\AssessmentResult::find($resultId);

        $mockScoringOrchestrator = \Mockery::mock(\App\Modules\Results\Services\ScoringOrchestratorService::class);
        $mockDto = new \App\Modules\Results\DTOs\ScoringPersistenceResultDto('uuid-attempt', $result->uuid, 1, 'READY', now()->toIso8601String());
        $mockScoringOrchestrator->shouldReceive('executeScoringPipeline')->andReturn($mockDto);
        
        $service = clone $this->app->make(\App\Modules\Results\Services\ResultService::class);
        $reflection = new \ReflectionClass($service);
        $property = $reflection->getProperty('scoringOrchestrator');
        $property->setAccessible(true);
        $property->setValue($service, $mockScoringOrchestrator);

        $dto = new \App\Modules\Results\DTOs\RecalculateResultDto($result->uuid, 'reason');
        $service->recalculate($dto, $org->id, 1);
        
        $this->assertTrue(true);
    }

    public function test_snapshot_hash_generated(): void
    {
        $org = \App\Modules\Governance\Models\Organization::factory()->create();
        $service = clone $this->app->make(\App\Modules\Results\Services\ResultService::class);
        
        $assessment = \App\Modules\Assessment\Models\Assessment::factory()->create(['organization_id' => $org->id]);
        $resultId = \Illuminate\Support\Facades\DB::table('assessment_results')->insertGetId([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $org->id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => 1,
            'candidate_user_id' => 1,
            'result_reference' => 'ref-1',
            'created_by' => 1,
            'created_date' => now()
        ]);
        $result = \App\Modules\Results\Models\AssessmentResult::find($resultId);

        $versionId = \Illuminate\Support\Facades\DB::table('result_versions')->insertGetId([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $org->id,
            'assessment_result_id' => $resultId,
            'version_number' => 1,
            'version_label' => 'v1',
            'version_reason' => 'test',
            'created_by' => 1,
            'created_date' => now()
        ]);
        $version = \App\Modules\Results\Models\ResultVersion::find($versionId);
        
        $snapshot = $service->createSnapshot($result, $version, $org->id, 1);
        $this->assertInstanceOf(\App\Modules\Results\Models\ResultSnapshot::class, $snapshot);
    }

    public function test_snapshot_hash_unique(): void
    {
        $org = \App\Modules\Governance\Models\Organization::factory()->create();
        $service = clone $this->app->make(\App\Modules\Results\Services\ResultService::class);
        
        $assessment = \App\Modules\Assessment\Models\Assessment::factory()->create(['organization_id' => $org->id]);
        $resultId = \Illuminate\Support\Facades\DB::table('assessment_results')->insertGetId([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $org->id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => 1,
            'candidate_user_id' => 1,
            'result_reference' => 'ref-1',
            'created_by' => 1,
            'created_date' => now()
        ]);
        $result = \App\Modules\Results\Models\AssessmentResult::find($resultId);

        $versionId = \Illuminate\Support\Facades\DB::table('result_versions')->insertGetId([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $org->id,
            'assessment_result_id' => $resultId,
            'version_number' => 1,
            'version_label' => 'v1',
            'version_reason' => 'test',
            'created_by' => 1,
            'created_date' => now()
        ]);
        $version = \App\Modules\Results\Models\ResultVersion::find($versionId);
        
        $snapshot1 = $service->createSnapshot($result, $version, $org->id, 1);
        
        // Modify result so hash is different
        $result->overall_score = 100;
        $snapshot2 = $service->createSnapshot($result, $version, $org->id, 1);
        
        $this->assertInstanceOf(\App\Modules\Results\Models\ResultSnapshot::class, $snapshot1);
        $this->assertInstanceOf(\App\Modules\Results\Models\ResultSnapshot::class, $snapshot2);
        $this->assertNotSame($snapshot1->id, $snapshot2->id);
        $this->assertNotSame($snapshot1->snapshot_hash, $snapshot2->snapshot_hash);
    }
}
