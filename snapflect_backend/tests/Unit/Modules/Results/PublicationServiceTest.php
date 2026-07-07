<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Results;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PublicationServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_publish_ready_result(): void
    {
        $org = \App\Modules\Governance\Models\Organization::factory()->create();
        $result = \App\Modules\Results\Models\AssessmentResult::create([
            'uuid' => 'uuid-1',
            'organization_id' => $org->id,
            'assessment_id' => 1,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => 1,
            'candidate_user_id' => 1,
            'result_status' => 'READY',
            'result_reference' => 'ref-1',
        ]);
        
        $dto = new \App\Modules\Results\DTOs\PublishResultDto('uuid-1', 'notes');
        $service = new \App\Modules\Results\Services\PublicationService();
        $service->publish($dto, $org->id, 1);
        
        $this->assertDatabaseHas('assessment_results', [
            'uuid' => 'uuid-1',
            'result_status' => 'PUBLISHED'
        ]);
    }

    public function test_archive_published_result(): void
    {
        $org = \App\Modules\Governance\Models\Organization::factory()->create();
        $result = \App\Modules\Results\Models\AssessmentResult::create([
            'uuid' => 'uuid-2',
            'organization_id' => $org->id,
            'assessment_id' => 1,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => 1,
            'candidate_user_id' => 1,
            'result_status' => 'PUBLISHED',
            'result_reference' => 'ref-2',
        ]);
        
        $dto = new \App\Modules\Results\DTOs\ArchiveResultDto('uuid-2', 'notes');
        $service = new \App\Modules\Results\Services\PublicationService();
        $service->archive($dto, $org->id, 1);
        
        $this->assertDatabaseHas('assessment_results', [
            'uuid' => 'uuid-2',
            'result_status' => 'ARCHIVED'
        ]);
    }

    public function test_illegal_publication_transition_fails(): void
    {
        $org = \App\Modules\Governance\Models\Organization::factory()->create();
        $result = \App\Modules\Results\Models\AssessmentResult::create([
            'uuid' => 'uuid-3',
            'organization_id' => $org->id,
            'assessment_id' => 1,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => 1,
            'candidate_user_id' => 1,
            'result_status' => 'PENDING',
            'result_reference' => 'ref-3',
        ]);
        
        $dto = new \App\Modules\Results\DTOs\PublishResultDto('uuid-3', 'notes');
        $service = new \App\Modules\Results\Services\PublicationService();
        
        $this->expectException(\App\Modules\Results\Exceptions\ResultPublicationException::class);
        $service->publish($dto, $org->id, 1);
    }
}
