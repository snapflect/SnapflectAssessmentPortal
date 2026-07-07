<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Assessment\Repositories;

use App\Modules\Assessment\Models\AssessmentBlueprint;
use App\Modules\Assessment\Repositories\Eloquent\BlueprintRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Illuminate\Support\Facades\Schema;

class BlueprintRepositoryTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected BlueprintRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        Schema::disableForeignKeyConstraints();
        $this->repository = new BlueprintRepository(new AssessmentBlueprint());
    }

    public function test_crud()
    {
        $data = [
            'uuid' => $this->faker->uuid,
            'organization_id' => 1,
            'assessment_id' => 1,
            'blueprint_name' => 'Test Blueprint',
            'status' => 'ACTIVE',
            'is_deleted' => false
        ];

        // Create
        $blueprint = $this->repository->create($data);
        $this->assertInstanceOf(AssessmentBlueprint::class, $blueprint);
        $this->assertEquals('Test Blueprint', $blueprint->blueprint_name);

        // Update
        $updated = $this->repository->update($blueprint->id, ['blueprint_name' => 'Updated Blueprint']);
        $this->assertTrue($updated);
        
        $found = $this->repository->findById($blueprint->id);
        $this->assertEquals('Updated Blueprint', $found->blueprint_name);

        // Delete
        $deleted = $this->repository->delete($blueprint->id);
        $this->assertTrue($deleted);
        $this->assertNull($this->repository->findById($blueprint->id));
    }

    public function test_tenant_isolation()
    {
        $this->repository->create([
            'uuid' => $this->faker->uuid,
            'organization_id' => 1,
            'assessment_id' => 1,
            'blueprint_name' => 'Org 1 Blueprint'
        ]);

        $this->repository->create([
            'uuid' => $this->faker->uuid,
            'organization_id' => 2,
            'assessment_id' => 2,
            'blueprint_name' => 'Org 2 Blueprint'
        ]);

        $results = $this->repository->searchByOrganization(1, []);
        $this->assertCount(1, $results);
        $this->assertEquals('Org 1 Blueprint', $results->first()->blueprint_name);
    }
}
