<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Repositories;

use App\Modules\Assessment\Models\Competency;
use App\Modules\Assessment\Repositories\Eloquent\CompetencyRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Illuminate\Support\Facades\Schema;

class CompetencyRepositoryTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected CompetencyRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        Schema::disableForeignKeyConstraints();
        $this->repository = new CompetencyRepository(new Competency());
    }

    public function test_crud()
    {
        $data = [
            'uuid' => $this->faker->uuid,
            'organization_id' => 1,
            'competency_group_id' => 1,
            'competency_code' => 'COMP-001',
            'competency_name' => 'Test Competency',
            'proficiency_level' => 1,
            'status' => 'ACTIVE',
            'is_deleted' => false
        ];

        // Create
        $competency = $this->repository->create($data);
        $this->assertInstanceOf(Competency::class, $competency);
        $this->assertEquals('Test Competency', $competency->competency_name);

        // Update
        $updated = $this->repository->update($competency->id, ['competency_name' => 'Updated Competency']);
        $this->assertTrue($updated);
        
        $found = $this->repository->findById($competency->id);
        $this->assertEquals('Updated Competency', $found->competency_name);

        // Delete
        $deleted = $this->repository->delete($competency->id);
        $this->assertTrue($deleted);
        $this->assertNull($this->repository->findById($competency->id));
    }

    public function test_tenant_isolation()
    {
        $this->repository->create([
            'uuid' => $this->faker->uuid,
            'organization_id' => 1,
            'competency_code' => 'ORG1-COMP',
            'competency_name' => 'Org 1 Competency'
        ]);

        $this->repository->create([
            'uuid' => $this->faker->uuid,
            'organization_id' => 2,
            'competency_code' => 'ORG2-COMP',
            'competency_name' => 'Org 2 Competency'
        ]);

        $results = $this->repository->searchByOrganization(1, []);
        $this->assertCount(1, $results);
        $this->assertEquals('Org 1 Competency', $results->first()->competency_name);
    }
}
