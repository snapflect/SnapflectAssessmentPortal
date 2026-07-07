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

        $this->user = User::factory()->create();

        $this->assessment = Assessment::factory()->create([
            'organization_id' => $this->user->organization_id,
            'assessment_code' => 'PUB-001',
            'assessment_name' => 'Publication Test Assessment',
            'estimated_duration_minutes' => 60,
            'is_published'    => false,
            'status'          => 'draft',
            'current_state'   => 'DRAFT',
            'created_by'      => $this->user->id,
        ]);

        $this->actingAs($this->user);
    }

    public function test_tenant_isolation_prevents_publishing_other_org_assessment()
    {
        $otherOrg = \App\Modules\Governance\Models\Organization::factory()->create();

        $otherOrgAssessment = Assessment::factory()->create([
            'organization_id' => $otherOrg->id,
            'assessment_code' => 'PUB-002',
            'assessment_name' => 'Other Org Assessment',
            'estimated_duration_minutes' => 60,
            'is_published'    => false,
            'status'          => 'draft',
            'current_state'   => 'READY',
            'created_by'      => $this->user->id,
        ]);

        $response = $this->postJson("/api/v1/assessment/assessments/{$otherOrgAssessment->uuid}/publish");

        $response->assertStatus(404); // Tenant isolation means they can't even see it
    }

    public function test_draft_to_ready_fails_validation()
    {
        // This assessment has no blueprint, so it fails validation
        $response = $this->postJson("/api/v1/assessment/assessments/{$this->assessment->uuid}/ready");

        $response->assertStatus(422);

        $this->assessment->refresh();
        $this->assertEquals('DRAFT', $this->assessment->current_state);
    }
}
