<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Results;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Modules\Security\Models\User;
use App\Modules\Security\Models\Role;
use App\Modules\Results\Models\AssessmentResult;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(int $orgId): User
    {
        $user = User::factory()->create(['organization_id' => $orgId]);
        $role = Role::factory()->create(['role_code' => 'ORGANIZATION_ADMIN']);
        $user->roles()->attach($role);
        return $user;
    }

    public function test_cross_tenant_access_denied(): void
    {
        $userOrg1 = $this->createAdminUser(1);
        $this->actingAs($userOrg1);

        $userOrg2 = User::factory()->create(['organization_id' => 2]);
        $resultOrg2 = AssessmentResult::create([
            'organization_id' => 2,
            'assessment_id' => 1,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => 1,
            'candidate_user_id' => $userOrg2->id,
            'result_reference' => 'REF-123',
            'result_version' => 1,
            'status' => 'COMPLETED',
            'overall_score' => 85,
        ]);

        $response = $this->getJson("/api/v1/results/{$resultOrg2->uuid}");

        $response->assertStatus(403);
    }

    public function test_cross_tenant_publication_denied(): void
    {
        $userOrg1 = $this->createAdminUser(1);
        $this->actingAs($userOrg1);

        $userOrg2 = User::factory()->create(['organization_id' => 2]);
        $resultOrg2 = AssessmentResult::create([
            'organization_id' => 2,
            'assessment_id' => 1,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => 1,
            'candidate_user_id' => $userOrg2->id,
            'result_reference' => 'REF-123',
            'result_version' => 1,
            'status' => 'COMPLETED',
            'overall_score' => 85,
        ]);

        $response = $this->postJson("/api/v1/results/{$resultOrg2->uuid}/publish", [
            'result_uuid' => $resultOrg2->uuid,
            'publication_notes' => 'Test'
        ]);

        $response->assertStatus(403);
    }
}
