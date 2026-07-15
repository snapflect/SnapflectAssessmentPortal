<?php
declare(strict_types=1);
namespace Tests\Feature\Security;
use Tests\TestCase;
use App\Modules\Security\Models\User;
use App\Modules\Security\Models\Role;
use App\Modules\Governance\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_org_admin_cannot_see_users_from_another_organization(): void
    {
        // Arrange: two separate organizations
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();

        // Create an ORG_ADMIN user belonging to orgA
        $role = Role::factory()->create(['role_code' => 'ORG_ADMIN']);
        $adminA = User::factory()->create(['organization_id' => $orgA->id]);
        $adminA->roles()->attach($role->id);

        // Create a user belonging to orgB
        $userB = User::factory()->create(['organization_id' => $orgB->id]);

        // Act: adminA attempts to view userB's profile
        $response = $this->actingAs($adminA)
                         ->getJson('/api/v1/security/users/' . $userB->uuid);

        // Assert: Policy should block cross-org access
        $response->assertStatus(403);
    }
}

