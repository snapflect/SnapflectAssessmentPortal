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

    public function test_unauthenticated_user_cannot_access(): void
    {
        // Act
        $response = $this->getJson('/api/v1/governance/organizations');

        // Assert
        $response->assertStatus(401);
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
                 ->assertJsonValidationErrors(['organization_code', 'organization_name', 'contact_email']);
    }
}
