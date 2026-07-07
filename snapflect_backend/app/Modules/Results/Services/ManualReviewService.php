<?php

declare(strict_types=1);

namespace App\Modules\Results\Services;

use App\Modules\Results\DTOs\CreateManualReviewDto;
use App\Modules\Results\DTOs\UpdateManualReviewDto;
use App\Modules\Results\Models\ManualScoreReview;
use App\Modules\Results\Exceptions\ManualReviewException;
use Illuminate\Support\Facades\DB;

class ManualReviewService
{
    public function getPendingQueue(int $organizationId, int $userId)
    {
        return ManualScoreReview::with([
            'assessmentResult.candidate', 
            'assessmentResult.assessment',
            'questionScore.question',
            'questionScore.attemptQuestion.answers'
        ])
        ->where('organization_id', $organizationId)
        ->where(function ($query) use ($userId) {
            $query->where('review_status', 'PENDING')
                  ->orWhere(function ($q) use ($userId) {
                      $q->where('review_status', 'IN_REVIEW')
                        ->where('reviewed_by', $userId);
                  });
        })
        ->where('is_deleted', 0)
        ->orderBy('created_date', 'asc')
        ->take(50)
        ->get();
    }

    public function lockReview(string $uuid, int $organizationId, int $userId): ManualScoreReview
    {
        return DB::transaction(function () use ($uuid, $organizationId, $userId) {
            $review = ManualScoreReview::where('uuid', $uuid)
                ->where('organization_id', $organizationId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($review->review_status === 'COMPLETED') {
                throw new ManualReviewException('Review is already completed.', 409);
            }
            
            if ($review->review_status === 'IN_REVIEW' && $review->reviewed_by !== $userId) {
                throw new ManualReviewException('Review is already locked by someone else.', 409);
            }

            if ($review->review_status === 'PENDING' || $review->reviewed_by === $userId) {
                $review->review_status = 'IN_REVIEW';
                $review->reviewed_by = $userId;
                $review->save();
            }

            return $review;
        });
    }

    public function createReview(CreateManualReviewDto $dto, int $organizationId, int $userId): ManualScoreReview
    {
        return DB::transaction(function () use ($dto, $organizationId, $userId) {
            $resultId = DB::table('assessment_results')->where('uuid', $dto->result_uuid)->value('id');
            $qs = DB::table('question_scores')->where('uuid', $dto->question_score_uuid)->first();
            
            if (!$resultId || !$qs) {
                throw new ManualReviewException('Invalid result or question score UUID', 404);
            }

            $review = new ManualScoreReview();
            $review->uuid = \Illuminate\Support\Str::uuid()->toString();
            $review->organization_id = $organizationId;
            $review->assessment_result_id = $resultId;
            $review->question_score_id = $qs->id;
            $review->reviewed_by = $userId;
            $review->original_score = $qs->awarded_score;
            $review->review_status = 'PENDING';
            $review->reviewed_score = $dto->reviewed_score;
            $review->review_comments = $dto->review_comments;
            $review->save();
            return $review;
        });
    }

    public function updateReview(UpdateManualReviewDto $dto, string $uuid, int $organizationId, int $userId): ManualScoreReview
    {
        return DB::transaction(function () use ($dto, $uuid, $organizationId, $userId) {
            $review = ManualScoreReview::where('uuid', $uuid)
                ->where('organization_id', $organizationId)
                ->lockForUpdate()
                ->firstOrFail();
            
            if ($dto->reviewed_score !== null) {
                $review->reviewed_score = $dto->reviewed_score;
            }
            if ($dto->review_comments !== null) {
                $review->review_comments = $dto->review_comments;
            }
            if ($dto->review_status !== null) {
                $review->review_status = $dto->review_status;
            }
            if ($review->review_status === 'COMPLETED') {
                $review->reviewed_at = now();
                $review->reviewed_by = $userId;
            }
            $review->save();
            
            if ($review->review_status === 'COMPLETED') {
                $attemptId = DB::table('assessment_results')->where('id', $review->assessment_result_id)->value('assessment_attempt_id');
                $attemptUuid = DB::table('assessment_attempts')->where('id', $attemptId)->value('uuid');
                
                $orchestrator = app(\App\Modules\Results\Services\ScoringOrchestratorService::class);
                $resultDto = $orchestrator->executeScoringPipeline($attemptUuid, true);
                
                $certService = app(\App\Modules\Results\Services\CertificateGenerationService::class);
                try {
                    $certService->generateForAttemptIfEligible($attemptUuid, $resultDto->version);
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Certificate generation failed for manual review attempt: {$attemptUuid}", ['error' => $e->getMessage()]);
                }
                
                $this->createAudit($review->assessment_result_id, 'MANUAL_OVERRIDE', 'Manual score review updated', $organizationId, $userId);
            }
            
            return $review;
        });
    }

    private function createAudit(int $resultId, string $type, string $description, int $organizationId, int $userId): void
    {
        DB::table('result_audits')->insert([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $organizationId,
            'assessment_result_id' => $resultId,
            'audit_type' => $type,
            'audit_description' => $description,
            'new_value_json' => '{}',
            'performed_by' => $userId,
            'performed_at' => \Carbon\Carbon::now(),
        ]);
    }
}
