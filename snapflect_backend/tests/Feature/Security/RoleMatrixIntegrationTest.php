<?php

namespace Tests\Feature\Security;

use Tests\TestCase;
use App\Modules\Security\Models\User;
use App\Modules\Security\Models\Role;
use App\Modules\Governance\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RoleMatrixIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected $organization;
    protected $readOnlyUser;
    protected $clientAdminUser;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->organization = Organization::factory()->create();

        $readOnlyRole = Role::factory()->create([
            'role_name' => 'Read Only',
            'role_code' => 'READ_ONLY',
        ]);

        $clientAdminRole = Role::factory()->create([
            'role_name' => 'Client Admin',
            'role_code' => 'CLIENT_ADMIN',
        ]);

        $this->readOnlyUser = User::factory()->create([
            'organization_id' => $this->organization->id,
        ]);
        $this->readOnlyUser->roles()->attach($readOnlyRole);

        $this->clientAdminUser = User::factory()->create([
            'organization_id' => $this->organization->id,
        ]);
        $this->clientAdminUser->roles()->attach($clientAdminRole);
    }

    public function test_read_only_persona_can_read_assessments()
    {
        $response = $this->actingAs($this->readOnlyUser)->getJson('/api/v1/assessment/assessments');
        $this->assertNotEquals(403, $response->getStatusCode());
    }

    public function test_read_only_persona_cannot_mutate_assessments()
    {
        $response = $this->actingAs($this->readOnlyUser)->postJson('/api/v1/assessment/assessments', [
            'assessment_code' => 'TEST_CODE',
            'assessment_name' => 'Test Assessment',
            'assessment_category_uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'assessment_type_uuid' => \Illuminate\Support\Str::uuid()->toString(),
        ]);
        $response->assertStatus(403);
    }

    public function test_client_admin_persona_can_mutate_assessments()
    {
        $response = $this->actingAs($this->clientAdminUser)->postJson('/api/v1/assessment/assessments', []);
        $this->assertNotEquals(403, $response->getStatusCode());
    }

    public function test_read_only_persona_can_read_blueprints()
    {
        $response = $this->actingAs($this->readOnlyUser)->getJson('/api/v1/assessment/blueprints');
        $this->assertNotEquals(403, $response->getStatusCode());
    }

    public function test_read_only_persona_cannot_mutate_blueprints()
    {
        $response = $this->actingAs($this->readOnlyUser)->postJson('/api/v1/assessment/blueprints', [
            'assessment_uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'blueprint_name' => 'Test Blueprint',
            'sections' => [
                [
                    'section_name' => 'Section 1',
                    'display_order' => 1,
                    'section_weight' => 10,
                    'selection_strategy' => 'MANUAL'
                ]
            ]
        ]);
        $response->assertStatus(403);
    }
}
