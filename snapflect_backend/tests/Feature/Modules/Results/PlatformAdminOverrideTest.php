<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Results;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Modules\Security\Models\User;
use App\Modules\Security\Models\Role;
use App\Modules\Results\Models\AssessmentResult;

class PlatformAdminOverrideTest extends TestCase
{
    use RefreshDatabase;

    private function createPlatformAdmin(): User
    {
        $user = User::factory()->create();
        $role = Role::factory()->create(['role_code' => 'PLATFORM_ADMIN']);
        $user->roles()->attach($role);
        return $user;
    }

    private function createValidAssessmentResult(User $user, float $score = 90): AssessmentResult
    {
        return AssessmentResult::create([
            'organization_id' => 1,
            'assessment_id' => 1,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => 1,
            'candidate_user_id' => $user->id,
            'result_reference' => 'REF-' . uniqid(),
            'result_status' => 'READY',
            'overall_score' => $score,
            'status' => 'ACTIVE',
        ]);
    }

    public function test_platform_admin_can_access_all_results(): void
    {
        $admin = $this->createPlatformAdmin();
        $this->actingAs($admin);

        // Candidate is another user entirely
        $candidate = User::factory()->create();
        $result = $this->createValidAssessmentResult($candidate, 95);

        $response = $this->getJson('/api/v1/results/' . $result->uuid);

        $response->assertStatus(200)
                 ->assertJsonPath('data.uuid', $result->uuid);
    }
}
