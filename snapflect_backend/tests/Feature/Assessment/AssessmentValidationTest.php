<?php

namespace Tests\Feature\Assessment;

use Tests\TestCase;
use App\Modules\Security\Models\User;
use App\Modules\Security\Models\Role;
use App\Modules\Governance\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AssessmentValidationTest extends TestCase
{
    use RefreshDatabase;

    protected $organization;
    protected $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->organization = Organization::factory()->create();

        $adminRole = Role::factory()->create([
            'role_name' => 'Client Admin',
            'role_code' => 'CLIENT_ADMIN',
        ]);

        $this->adminUser = User::factory()->create([
            'organization_id' => $this->organization->id,
        ]);
        $this->adminUser->roles()->attach($adminRole);
    }

    public function test_assessment_creation_fails_without_required_fields()
    {
        $response = $this->actingAs($this->adminUser)->postJson('/api/v1/assessment/assessments', []);
        
        $response->assertJsonStructure([
            'detail' => ['assessment_name', 'assessment_category_uuid', 'assessment_type_uuid']
        ]);
    }

    public function test_assessment_creation_uses_custom_messages()
    {
        $response = $this->actingAs($this->adminUser)->postJson('/api/v1/assessment/assessments', []);
        
        $response->assertStatus(422);
        $response->assertJsonPath('detail.assessment_name.0', 'The assessment name field is required.');
    }

    public function test_blueprint_creation_fails_without_required_fields()
    {
        $response = $this->actingAs($this->adminUser)->postJson('/api/v1/assessment/blueprints', []);
        
        $response->assertStatus(422);
        $response->assertJsonStructure([
            'detail' => ['assessment_uuid', 'blueprint_name', 'sections']
        ]);
    }

    public function test_blueprint_creation_validates_section_weight()
    {
        $response = $this->actingAs($this->adminUser)->postJson('/api/v1/assessment/blueprints', [
            'assessment_uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'blueprint_name' => 'Test',
            'sections' => [
                [
                    'section_name' => 'Section',
                    'display_order' => 1,
                    'section_weight' => 150, // Invalid, max 100
                    'selection_strategy' => 'MANUAL'
                ]
            ]
        ]);
        
        $response->assertStatus(422);
        $response->assertStatus(422);
        
        $json = $response->json();
        $this->assertArrayHasKey('sections.0.section_weight', $json['detail']);
        $this->assertEquals('A section weight cannot exceed 100%.', $json['detail']['sections.0.section_weight'][0]);
    }
}
