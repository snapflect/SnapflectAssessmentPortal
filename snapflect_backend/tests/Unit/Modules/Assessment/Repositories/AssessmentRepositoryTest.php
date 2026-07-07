<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Repositories;

use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Repositories\Eloquent\AssessmentRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Illuminate\Support\Facades\Schema;

class AssessmentRepositoryTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected AssessmentRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        Schema::disableForeignKeyConstraints();
        $this->repository = new AssessmentRepository(new Assessment());
    }

    public function test_crud()
    {
        $organizationId = 1;
        $data = [
            'uuid' => $this->faker->uuid,
            'organization_id' => $organizationId,
            'assessment_name' => 'Test Assessment',
            'assessment_code' => 'TST-001',
            'description' => 'Test description',
            'assessment_category_id' => 1,
            'assessment_type_id' => 1,
            'current_state' => 'DRAFT',
            'status' => 'ACTIVE',
            'is_deleted' => false
        ];

        // Create
        $assessment = $this->repository->create($data);
        $this->assertInstanceOf(Assessment::class, $assessment);
        $this->assertEquals('Test Assessment', $assessment->assessment_name);
        $this->assertDatabaseHas('assessments', ['id' => $assessment->id, 'assessment_name' => 'Test Assessment']);

        // Update
        $updated = $this->repository->update($assessment->id, ['assessment_name' => 'Updated Title']);
        $this->assertTrue($updated);
        $this->assertDatabaseHas('assessments', ['id' => $assessment->id, 'assessment_name' => 'Updated Title']);

        // Delete
        $deleted = $this->repository->delete($assessment->id);
        $this->assertTrue($deleted);
        $this->assertDatabaseHas('assessments', ['id' => $assessment->id, 'is_deleted' => 1, 'status' => 'DELETED']);

        // Find By ID (Should be null because of global scope / base query excluding deleted)
        $found = $this->repository->findById($assessment->id);
        $this->assertNull($found);
    }

    public function test_search()
    {
        $this->repository->create([
            'uuid' => $this->faker->uuid,
            'organization_id' => 1,
            'assessment_name' => 'Searchable Assessment',
            'assessment_code' => 'SRCH-001',
            'assessment_category_id' => 1,
            'assessment_type_id' => 1,
            'current_state' => 'DRAFT',
            'is_deleted' => false
        ]);

        $results = $this->repository->search(['assessment_name' => 'Searchable Assessment']);
        $this->assertCount(1, $results);
        $this->assertEquals('Searchable Assessment', $results->first()->assessment_name);
    }

    public function test_pagination()
    {
        for ($i = 0; $i < 5; $i++) {
            $this->repository->create([
                'uuid' => $this->faker->uuid,
                'organization_id' => 1,
                'assessment_name' => 'Pagination Assessment ' . $i,
                'assessment_code' => 'PAG-' . $i,
                'assessment_category_id' => 1,
                'assessment_type_id' => 1,
                'current_state' => 'DRAFT',
                'is_deleted' => false
            ]);
        }

        $paginator = $this->repository->paginate(2);
        $this->assertEquals(2, $paginator->count());
        $this->assertEquals(5, $paginator->total());
    }

    public function test_tenant_isolation()
    {
        $this->repository->create([
            'uuid' => $this->faker->uuid,
            'organization_id' => 1,
            'assessment_name' => 'Org 1 Assessment',
            'assessment_code' => 'ORG1-001',
            'assessment_category_id' => 1,
            'assessment_type_id' => 1,
            'current_state' => 'DRAFT'
        ]);

        $this->repository->create([
            'uuid' => $this->faker->uuid,
            'organization_id' => 2,
            'assessment_name' => 'Org 2 Assessment',
            'assessment_code' => 'ORG2-001',
            'assessment_category_id' => 1,
            'assessment_type_id' => 1,
            'current_state' => 'DRAFT'
        ]);

        $results = $this->repository->searchByOrganization(1, []);
        $this->assertCount(1, $results);
        $this->assertEquals('Org 1 Assessment', $results->first()->assessment_name);
    }

    public function test_soft_deletes()
    {
        $assessment = $this->repository->create([
            'uuid' => $this->faker->uuid,
            'organization_id' => 1,
            'assessment_name' => 'Soft Delete Assessment',
            'assessment_code' => 'DEL-001',
            'assessment_category_id' => 1,
            'assessment_type_id' => 1,
            'current_state' => 'DRAFT',
            'is_deleted' => false
        ]);

        $deleted = $this->repository->delete($assessment->id);
        $this->assertTrue($deleted);

        $trashed = $this->repository->findOnlyTrashed();
        $this->assertCount(1, $trashed);
        $this->assertEquals($assessment->id, $trashed->first()->id);

        $withTrashed = $this->repository->findWithTrashed($assessment->id);
        $this->assertNotNull($withTrashed);
        $this->assertEquals($assessment->id, $withTrashed->id);
    }

    public function test_uuid_retrieval()
    {
        $uuid = $this->faker->uuid;
        $this->repository->create([
            'uuid' => $uuid,
            'organization_id' => 1,
            'assessment_name' => 'UUID Assessment',
            'assessment_code' => 'UUID-001',
            'assessment_category_id' => 1,
            'assessment_type_id' => 1,
            'current_state' => 'DRAFT'
        ]);

        $found = $this->repository->findByUuid($uuid);
        $this->assertNotNull($found);
        $this->assertEquals('UUID Assessment', $found->assessment_name);
    }
}
