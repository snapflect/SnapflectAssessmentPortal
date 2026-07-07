<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Results;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Modules\Security\Models\User;
use App\Modules\Security\Models\Role;
use App\Modules\Security\Models\Organization;
use App\Modules\Results\Models\AssessmentResult;

class AssessmentResultApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    private function createCandidateUser(): User
    {
        $user = User::factory()->create();
        $role = Role::factory()->create(['role_code' => 'CANDIDATE']);
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

    public function test_invalid_uuid_rejected(): void
    {
        $user = $this->createCandidateUser();
        $this->actingAs($user);

        $response = $this->getJson('/api/v1/results/invalid-uuid');

        $response->assertStatus(404);
    }

    public function test_snapshot_payload_hidden_from_api(): void
    {
        $user = $this->createCandidateUser();
        $this->actingAs($user);

        $result = $this->createValidAssessmentResult($user, 80.5);

        $response = $this->getJson('/api/v1/results/' . $result->uuid);

        // Usually it shouldn't contain snapshot directly if it's hidden
        $response->assertStatus(200);
        $response->assertJsonMissing(['snapshot_payload']);
    }

    public function test_candidate_can_view_own_result(): void
    {
        $user = $this->createCandidateUser();
        $this->actingAs($user);

        $result = $this->createValidAssessmentResult($user, 90);

        $response = $this->getJson('/api/v1/results/' . $result->uuid);

        $response->assertStatus(200)
                 ->assertJsonPath('data.uuid', $result->uuid);
    }

    public function test_candidate_cannot_view_foreign_result(): void
    {
        $user1 = $this->createCandidateUser();
        $user2 = $this->createCandidateUser();
        $this->actingAs($user1);

        $result = $this->createValidAssessmentResult($user2, 90);

        $response = $this->getJson('/api/v1/results/' . $result->uuid);

        $response->assertStatus(403);
    }
}
