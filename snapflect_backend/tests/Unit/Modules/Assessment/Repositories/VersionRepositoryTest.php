<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Repositories;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Modules\Assessment\Repositories\Eloquent\VersionRepository;
use App\Modules\Assessment\Models\AssessmentVersion;
use App\Modules\Assessment\Models\Assessment;

class VersionRepositoryTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected VersionRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new VersionRepository(new AssessmentVersion());
    }

    public function test_crud()
    {
        $assessment = Assessment::factory()->create();

        $data = [
            'assessment_id' => $assessment->id,
            'major_version' => 1,
            'minor_version' => 0,
            'version_label' => '1.0',
            'change_summary' => 'Initial Version',
            'organization_id' => $assessment->organization_id,
            'is_deleted' => false,
        ];

        $version = $this->repository->create($data);
        $this->assertInstanceOf(AssessmentVersion::class, $version);
        $this->assertEquals(1, $version->major_version);

        $found = $this->repository->findById($version->id);
        $this->assertEquals($version->id, $found->id);

        $this->repository->update($version->id, ['minor_version' => 1]);
        $updated = $this->repository->findById($version->id);
        $this->assertEquals(1, $updated->minor_version);

        $this->repository->delete($version->id);
        $deleted = $this->repository->findById($version->id);
        $this->assertNull($deleted);
    }

    public function test_history_retrieval()
    {
        $assessment = Assessment::factory()->create();

        $this->repository->create([
            'assessment_id' => $assessment->id,
            'major_version' => 1,
            'minor_version' => 0,
            'version_label' => '1.0',
            'organization_id' => $assessment->organization_id,
        ]);

        $this->repository->create([
            'assessment_id' => $assessment->id,
            'major_version' => 1,
            'minor_version' => 1,
            'version_label' => '1.1',
            'organization_id' => $assessment->organization_id,
        ]);

        $this->repository->create([
            'assessment_id' => $assessment->id,
            'major_version' => 2,
            'minor_version' => 0,
            'version_label' => '2.0',
            'organization_id' => $assessment->organization_id,
        ]);

        $history = $this->repository->findVersionHistory($assessment->id);
        $this->assertCount(3, $history);
        $this->assertEquals(2, $history->first()->major_version);
        $this->assertEquals(0, $history->first()->minor_version);

        $current = $this->repository->findCurrentVersion($assessment->id);
        $this->assertNotNull($current);
        $this->assertEquals(2, $current->major_version);
    }
}
