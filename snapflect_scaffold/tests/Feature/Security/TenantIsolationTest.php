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
        // Arrange
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();

        $adminA = User::factory()->create(['organization_id' => $orgA->id]);
        $role = Role::factory()->create(['role_code' => 'ORG_ADMIN']);
        $adminA->roles()->attach($role->id);

        $userB = User::factory()->create(['organization_id' => $orgB->id]);

        $this->actingAs($adminA);

        // Act
        $response = $this->getJson('/api/v1/security/users/' . $userB->uuid);

        // Assert
        // Policy should block viewing a user outside their tenant
        $response->assertStatus(403);
    }
}
