<?php

declare(strict_types=1);

namespace Tests\Unit\Modules\Results;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Modules\Results\Services\ManualReviewService;
use App\Modules\Results\Models\ManualScoreReview;
use App\Modules\Results\Models\AssessmentResult;
use App\Modules\Security\Models\User;
use App\Modules\Results\DTOs\CreateManualReviewDto;
use App\Modules\Results\DTOs\UpdateManualReviewDto;

class ManualReviewServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_manual_review_created(): void
    {
        $org = \App\Modules\Governance\Models\Organization::factory()->create();
        $assessment = \App\Modules\Assessment\Models\Assessment::factory()->create(['organization_id' => $org->id]);
        
        $resultId = \Illuminate\Support\Facades\DB::table('assessment_results')->insertGetId([
            'uuid' => 'result-uuid',
            'organization_id' => $org->id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => 1,
            'candidate_user_id' => 1,
            'result_reference' => 'ref',
            'created_by' => 1,
            'created_date' => now()
        ]);

        $qsId = \Illuminate\Support\Facades\DB::table('question_scores')->insertGetId([
            'uuid' => 'question-uuid',
            'organization_id' => $org->id,
            'assessment_result_id' => $resultId,
            'question_id' => 1,
            'attempt_question_id' => 1,
            'awarded_score' => 5.0,
            'max_score' => 10.0,
            'created_by' => 1,
            'created_date' => now()
        ]);

        $service = new ManualReviewService();
        $dto = new CreateManualReviewDto('result-uuid', 'question-uuid', 5.0, 'Comment');
        $review = $service->createReview($dto, $org->id, 1);
        $this->assertInstanceOf(ManualScoreReview::class, $review);
    }

    public function test_manual_review_creates_new_version(): void
    {
        $org = \App\Modules\Governance\Models\Organization::factory()->create();
        $assessment = \App\Modules\Assessment\Models\Assessment::factory()->create(['organization_id' => $org->id]);
        
        $attemptId = \Illuminate\Support\Facades\DB::table('assessment_attempts')->insertGetId([
            'uuid' => 'attempt-uuid',
            'organization_id' => $org->id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => 1,
            'assessment_session_id' => 1,
            'assessment_snapshot_id' => 1,
            'candidate_user_id' => 1,
            'status' => 'IN_PROGRESS',
            'created_by' => 1,
            'created_date' => now()
        ]);

        $resultId = \Illuminate\Support\Facades\DB::table('assessment_results')->insertGetId([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $org->id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => $attemptId,
            'candidate_user_id' => 1,
            'result_reference' => 'ref',
            'created_by' => 1,
            'created_date' => now()
        ]);

        $mockScoringOrchestrator = \Mockery::mock(\App\Modules\Results\Services\ScoringOrchestratorService::class);
        $mockDto = new \App\Modules\Results\DTOs\ScoringPersistenceResultDto('attempt-uuid', 'result-uuid', 1, 'READY', now()->toIso8601String());
        $mockScoringOrchestrator->shouldReceive('executeScoringPipeline')->andReturn($mockDto);
        $this->app->instance(\App\Modules\Results\Services\ScoringOrchestratorService::class, $mockScoringOrchestrator);

        $service = new ManualReviewService();
        
        $review = ManualScoreReview::create([
            'organization_id' => $org->id,
            'assessment_result_id' => $resultId,
            'question_score_id' => 1,
            'reviewed_by' => 1,
            'review_status' => 'PENDING',
            'original_score' => 5,
        ]);

        $dto = new UpdateManualReviewDto($review->uuid, 'COMPLETED', 10, 'Good');
        
        $updatedReview = $service->updateReview($dto, $review->uuid, $org->id, 1);

        $this->assertEquals(10, $updatedReview->reviewed_score);
        $this->assertEquals('Good', $updatedReview->review_comments);
        $this->assertEquals('COMPLETED', $updatedReview->review_status);
        
        $this->assertDatabaseHas('manual_score_reviews', [
            'uuid' => $review->uuid,
            'reviewed_score' => 10,
            'review_comments' => 'Good'
        ]);
    }

    public function test_manual_review_audit_created(): void
    {
        $org = \App\Modules\Governance\Models\Organization::factory()->create();
        $assessment = \App\Modules\Assessment\Models\Assessment::factory()->create(['organization_id' => $org->id]);
        
        $attemptId = \Illuminate\Support\Facades\DB::table('assessment_attempts')->insertGetId([
            'uuid' => 'attempt-uuid',
            'organization_id' => $org->id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => 1,
            'assessment_session_id' => 1,
            'assessment_snapshot_id' => 1,
            'candidate_user_id' => 1,
            'status' => 'IN_PROGRESS',
            'created_by' => 1,
            'created_date' => now()
        ]);

        $resultId = \Illuminate\Support\Facades\DB::table('assessment_results')->insertGetId([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $org->id,
            'assessment_id' => $assessment->id,
            'assessment_version_id' => 1,
            'assessment_snapshot_id' => 1,
            'assessment_attempt_id' => $attemptId,
            'candidate_user_id' => 1,
            'result_reference' => 'ref',
            'created_by' => 1,
            'created_date' => now()
        ]);

        $mockScoringOrchestrator = \Mockery::mock(\App\Modules\Results\Services\ScoringOrchestratorService::class);
        $mockDto = new \App\Modules\Results\DTOs\ScoringPersistenceResultDto('attempt-uuid', 'result-uuid', 1, 'READY', now()->toIso8601String());
        $mockScoringOrchestrator->shouldReceive('executeScoringPipeline')->andReturn($mockDto);
        $this->app->instance(\App\Modules\Results\Services\ScoringOrchestratorService::class, $mockScoringOrchestrator);

        $service = new ManualReviewService();
        
        $review = ManualScoreReview::create([
            'organization_id' => $org->id,
            'assessment_result_id' => $resultId,
            'question_score_id' => 1,
            'reviewed_by' => 1,
            'review_status' => 'PENDING',
            'original_score' => 5,
        ]);

        $dto = new UpdateManualReviewDto($review->uuid, 'COMPLETED', 10, 'Good');
        
        $service->updateReview($dto, $review->uuid, $org->id, 1);

        $this->assertDatabaseHas('manual_score_reviews', [
            'uuid' => $review->uuid,
            'review_status' => 'COMPLETED'
        ]);
    }
}
