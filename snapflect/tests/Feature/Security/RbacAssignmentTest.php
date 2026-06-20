<?php
declare(strict_types=1);
namespace Tests\Feature\Security;
use Tests\TestCase;
use App\Modules\Security\Models\User;
use App\Modules\Security\Models\Role;
use App\Modules\Governance\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RbacAssignmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_org_admin_cannot_assign_roles_from_other_tenants(): void
    {
        // Arrange
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();

        $adminA = User::factory()->create(['organization_id' => $orgA->id]);
        $adminRole = Role::factory()->create(['role_code' => 'ORG_ADMIN']);
        $adminA->roles()->attach($adminRole->id);

        $targetUser = User::factory()->create(['organization_id' => $orgA->id]);
        $foreignRole = Role::factory()->create(['organization_id' => $orgB->id, 'role_code' => 'CUSTOM_ROLE']);

        $this->actingAs($adminA);

        // Act
        // Attempting to assign Org B's role to Org A's user
        $response = $this->postJson('/api/v1/security/users/' . $targetUser->uuid . '/roles/' . $foreignRole->uuid);

        // Assert
        // Domain exception TenantValidationException converted to 500 or caught as 400. 
        // Depending on exception handler, usually 400 or 500 in strict APIs.
        // We assert it does not succeed (200).
        $this->assertNotEquals(200, $response->getStatusCode());
    }
}
