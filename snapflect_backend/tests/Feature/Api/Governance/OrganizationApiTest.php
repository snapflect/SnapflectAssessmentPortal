<?php
declare(strict_types=1);
namespace Tests\Feature\Api\Governance;
use Tests\TestCase;
use App\Modules\Security\Models\User;
use App\Modules\Security\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OrganizationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\CustomRbacSeeder::class);
        $this->seed(\Database\Seeders\BillingSeeder::class);
    }

    public function test_unauthenticated_user_cannot_access(): void
    {
        // Act
        $response = $this->getJson('/api/v1/governance/organizations');

        // Assert
        $response->assertStatus(403);
    }

    public function test_it_validates_required_fields_on_create(): void
    {
        // Arrange
        $user = User::factory()->create();
        $role = Role::factory()->create(['role_code' => 'PLATFORM_ADMIN']);
        $user->roles()->attach($role->id);
        
        $this->actingAs($user);

        // Act
        $response = $this->postJson('/api/v1/governance/organizations', [
            'organization_code' => '', // Invalid
            'contact_email' => 'invalid-email' // Invalid
        ]);

        // Assert
        $response->assertStatus(422)
                 ->assertJsonStructure([
                     'detail' => [
                         'organization_code',
                         'organization_name',
                         'contact_email'
                     ]
                 ]);
    }

    public function test_it_creates_organization_successfully(): void
    {
        // Arrange
        $user = User::factory()->create();
        $role = Role::factory()->create(['role_code' => 'PLATFORM_ADMIN']);
        $user->roles()->attach($role->id);
        
        $this->actingAs($user);

        // Act
        $response = $this->postJson('/api/v1/governance/organizations', [
            'organization_code' => 'TEST-NEW',
            'organization_name' => 'New Test Organization',
            'contact_email' => 'admin@testnew.com',
            'plan_code' => 'BASIC_1M'
        ]);

        // Assert
        $response->assertStatus(200);
        $this->assertDatabaseHas('organizations', [
            'organization_code' => 'TEST-NEW'
        ]);
        
        // Assert billing was created
        $orgUuid = $response->json('uuid') ?? $response->json('data.uuid');
        $org = \App\Modules\Governance\Models\Organization::where('uuid', $orgUuid)->first();
        
        $this->assertDatabaseHas('tenant_subscriptions', [
            'organization_id' => $org->id,
            'status' => 'ACTIVE'
        ]);
    }
}
