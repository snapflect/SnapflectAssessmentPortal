<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Assessment\API;

use Tests\TestCase;
use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\Assessment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

class AssessmentValidationFeatureTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Assessment $assessment;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->assessment = Assessment::factory()->create([
            'organization_id' => $this->user->organization_id,
            'assessment_code' => 'VAL-001',
            'assessment_name' => 'Validation Test Assessment',
            'estimated_duration_minutes' => 60,
            'is_published'    => false,
            'status'          => 'draft',
            'created_by'      => $this->user->id,
        ]);

        $this->actingAs($this->user);
    }

    public function test_can_validate_assessment_endpoint()
    {
        $response = $this->postJson("/api/v1/assessment/assessments/{$this->assessment->uuid}/validate");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'assessment_uuid',
                    'is_valid',
                    'ready_for_publication',
                    'validation_errors',
                    'validated_at'
                ],
                'message'
            ]);

        // Because we haven't created blueprint/sections in the DB for this setup, it should fail AV-003
        $response->assertJsonPath('data.is_valid', false);
        $response->assertJsonPath('data.ready_for_publication', false);

        $errors = $response->json('data.validation_errors');
        $this->assertNotEmpty($errors);
        $rules = array_column($errors, 'rule');
        $this->assertContains('RULE-AV-003', $rules);
    }

    public function test_tenant_isolation_prevents_validating_other_org_assessment()
    {
        $otherOrg = \App\Modules\Governance\Models\Organization::factory()->create();

        $otherOrgAssessment = Assessment::factory()->create([
            'organization_id' => $otherOrg->id,
            'assessment_code' => 'VAL-002',
            'assessment_name' => 'Other Org Assessment',
            'estimated_duration_minutes' => 60,
            'is_published'    => false,
            'status'          => 'draft',
            'created_by'      => $this->user->id,
        ]);

        $response = $this->postJson("/api/v1/assessment/assessments/{$otherOrgAssessment->uuid}/validate");

        $response->assertStatus(200); // We return 200 with validation result, but isValid is false due to Tenant mismatch RULE-AV-000
        $response->assertJsonPath('data.is_valid', false);

        $errors = $response->json('data.validation_errors');
        $this->assertCount(1, $errors);
        $this->assertEquals('RULE-AV-000', $errors[0]['rule']);
    }
}
