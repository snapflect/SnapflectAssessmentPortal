<?php
declare(strict_types=1);
namespace Tests\Unit\Repositories\Governance;
use Tests\TestCase;
use App\Modules\Governance\Models\Organization;
use App\Modules\Governance\Repositories\OrganizationRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OrganizationRepositoryTest extends TestCase
{
    use RefreshDatabase;

    private OrganizationRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        // Assuming binding exists or instantiating directly for unit test
        $this->repository = $this->app->make(OrganizationRepository::class);
    }

    public function test_it_can_create_an_organization(): void
    {
        // Arrange
        $data = [
            'organization_code' => 'ORG-001',
            'organization_name' => 'Acme Corp',
            'created_by' => 1,
            'modified_by' => 1,
        ];

        // Act
        $organization = $this->repository->create($data);

        // Assert
        $this->assertInstanceOf(Organization::class, $organization);
        $this->assertEquals('ORG-001', $organization->organization_code);
        $this->assertNotNull($organization->uuid);
    }

    public function test_it_can_find_by_uuid(): void
    {
        // Arrange
        $organization = Organization::factory()->create();

        // Act
        $found = $this->repository->findByUuid($organization->uuid);

        // Assert
        $this->assertNotNull($found);
        $this->assertEquals($organization->id, $found->id);
    }
}
