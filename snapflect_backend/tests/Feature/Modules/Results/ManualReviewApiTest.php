<?php

declare(strict_types=1);

namespace Tests\Feature\Modules\Results;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Modules\Security\Models\User;
use App\Modules\Security\Models\Role;
use App\Modules\Results\Models\AssessmentResult;
use App\Modules\Results\Models\ManualScoreReview;

class ManualReviewApiTest extends TestCase
{
    use RefreshDatabase;

    private function createReviewerUser(): User
    {
        $user = User::factory()->create();
        $role = Role::factory()->create(['role_code' => 'EVALUATOR']);
        $user->roles()->attach($role);
        return $user;
    }

    private function createManualScoreReview(User $reviewer): ManualScoreReview
    {
        $result = AssessmentResult::create([
            'organization_id' => 1,
            'assessment_id' => 1,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => 1,
            'candidate_user_id' => 1,
            'result_reference' => 'REF-M-' . uniqid(),
            'result_status' => 'PENDING',
        ]);

        return ManualScoreReview::create([
            'organization_id' => 1,
            'assessment_result_id' => $result->id,
            'question_score_id' => 1,
            'reviewed_by' => $reviewer->id,
            'review_status' => 'PENDING',
            'original_score' => 5.0,
            'status' => 'ACTIVE',
        ]);
    }

    public function test_negative_score_rejected(): void
    {
        $user = $this->createReviewerUser();
        $this->actingAs($user);

        $review = $this->createManualScoreReview($user);

        $response = $this->patchJson('/api/v1/results/manual-reviews/' . $review->uuid, [
            'reviewed_score' => -10,
        ]);

        // Unprocessable Entity due to validation rule for min:0
        $response->assertStatus(422);
    }
}
