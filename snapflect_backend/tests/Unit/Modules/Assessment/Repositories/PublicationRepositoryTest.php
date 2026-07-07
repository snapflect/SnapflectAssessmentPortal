<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Repositories;

use App\Modules\Assessment\Models\AssessmentPublication;
use App\Modules\Assessment\Models\AssessmentSnapshot;
use App\Modules\Assessment\Repositories\Eloquent\PublicationRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Illuminate\Support\Facades\Schema;

class PublicationRepositoryTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected PublicationRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        Schema::disableForeignKeyConstraints();
        $this->repository = new PublicationRepository(new AssessmentPublication());
    }

    public function test_crud()
    {
        $data = [
            'uuid' => $this->faker->uuid,
            'publication_code' => 'PUB-001',
            'title' => 'Test Publication',
            'assessment_id' => 1,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'published_by' => 1,
            'published_date' => now(),
            'status' => 'ACTIVE',
            'is_deleted' => false
        ];

        // Create
        $publication = $this->repository->create($data);
        $this->assertInstanceOf(AssessmentPublication::class, $publication);
        $this->assertEquals('Test Publication', $publication->title);

        // Update
        $updated = $this->repository->update($publication->id, ['title' => 'Updated Publication']);
        $this->assertTrue($updated);
        
        $found = $this->repository->findById($publication->id);
        $this->assertEquals('Updated Publication', $found->title);

        // Delete
        $deleted = $this->repository->delete($publication->id);
        $this->assertTrue($deleted);
        $this->assertNull($this->repository->findById($publication->id));
    }

    public function test_latest_snapshot_retrieval()
    {
        $snapshot1 = AssessmentSnapshot::create([
            'uuid' => $this->faker->uuid,
            'organization_id' => 1,
            'assessment_id' => 1,
            'assessment_version_id' => 1,
            'snapshot_json' => '{"v": 1}',
            'snapshot_hash' => 'hash1',
            'published_by' => 1
        ]);
        
        $snapshot2 = AssessmentSnapshot::create([
            'uuid' => $this->faker->uuid,
            'organization_id' => 1,
            'assessment_id' => 1,
            'assessment_version_id' => 1,
            'snapshot_json' => '{"v": 2}',
            'snapshot_hash' => 'hash2',
            'published_by' => 1
        ]);

        $this->repository->create([
            'uuid' => $this->faker->uuid,
            'publication_code' => 'PUB-OLD',
            'assessment_id' => 1,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => $snapshot1->id,
            'published_by' => 1,
            'published_date' => now()->subDay(),
            'title' => 'Old Pub',
            'is_deleted' => false
        ]);

        $this->repository->create([
            'uuid' => $this->faker->uuid,
            'publication_code' => 'PUB-NEW',
            'assessment_id' => 1,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => $snapshot2->id,
            'published_by' => 1,
            'published_date' => now(),
            'title' => 'New Pub',
            'is_deleted' => false
        ]);

        $latestSnapshot = $this->repository->findLatestSnapshot(1);
        $this->assertNotNull($latestSnapshot);
        $this->assertEquals($snapshot2->id, $latestSnapshot->id);
    }
}
