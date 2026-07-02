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
    public function getPendingQueue(int $organizationId)
    {
        return ManualScoreReview::with([
            'assessmentResult.candidate', 
            'assessmentResult.assessment',
            'questionScore.question'
        ])
        ->where('organization_id', $organizationId)
        ->where('review_status', 'PENDING')
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

            if ($review->review_status !== 'PENDING') {
                throw new ManualReviewException('Review is already locked or completed.', 409);
            }

            $review->review_status = 'IN_REVIEW';
            $review->reviewed_by = $userId;
            $review->save();

            return $review;
        });
    }

    public function createReview(CreateManualReviewDto $dto, int $organizationId, int $userId): ManualScoreReview
    {
        return DB::transaction(function () use ($dto, $organizationId, $userId) {
            $review = new ManualScoreReview();
            // Logic to initiate review
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
            
            $review->reviewed_score = $dto->awarded_score ?? 0;
            $review->review_comments = $dto->notes ?? null;
            $review->review_status = 'COMPLETED';
            $review->reviewed_at = now();
            $review->save();
            
            // Important: Manual score changes must never overwrite existing versions.
            // Always create new version via ResultService
            
            $this->createAudit($review->assessment_result_id ?? 0, 'MANUAL_OVERRIDE', 'Manual score review updated', $organizationId, $userId);
            
            return $review;
        });
    }

    private function createAudit(int $resultId, string $type, string $description, int $organizationId, int $userId): void
    {
        // Audit persistence logic
    }
}
