<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Assessment\API;

use Tests\TestCase;
use App\Modules\Security\Models\User;
use App\Modules\Assessment\Models\Assessment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

class AssessmentPublicationFeatureTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Assessment $assessment;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'organization_id' => 1,
        ]);

        $this->assessment = Assessment::create([
            'uuid' => Str::uuid()->toString(),
            'organization_id' => 1,
            'assessment_code' => 'PUB-001',
            'assessment_name' => 'Publication Test Assessment',
            'estimated_duration_minutes' => 60,
            'is_published' => false,
            'status' => 'draft',
            'current_state' => 'DRAFT',
            'created_by' => $this->user->id
        ]);
        
        Sanctum::actingAs($this->user, ['*']);
    }

    public function test_tenant_isolation_prevents_publishing_other_org_assessment()
    {
        $otherOrgAssessment = Assessment::create([
            'uuid' => Str::uuid()->toString(),
            'organization_id' => 2,
            'assessment_code' => 'PUB-002',
            'assessment_name' => 'Other Org Assessment',
            'estimated_duration_minutes' => 60,
            'is_published' => false,
            'status' => 'draft',
            'current_state' => 'READY',
            'created_by' => $this->user->id
        ]);

        $response = $this->postJson("/api/v1/assessment/assessments/{$otherOrgAssessment->uuid}/publish");

        $response->assertStatus(500); // Because it throws AssessmentPublicationException
    }

    public function test_draft_to_ready_fails_validation()
    {
        // This assessment has no blueprint, so it fails validation
        $response = $this->postJson("/api/v1/assessment/assessments/{$this->assessment->uuid}/ready");
        
        $response->assertStatus(500);
        
        $this->assessment->refresh();
        $this->assertEquals('DRAFT', $this->assessment->current_state);
    }
}
