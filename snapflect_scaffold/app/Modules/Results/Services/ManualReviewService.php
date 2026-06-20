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
    public function createReview(CreateManualReviewDto $dto, int $organizationId, int $userId): ManualScoreReview
    {
        return DB::transaction(function () use ($dto, $organizationId, $userId) {
            $review = new ManualScoreReview();
            // Logic to initiate review
            return $review;
        });
    }

    public function updateReview(UpdateManualReviewDto $dto, int $organizationId, int $userId): ManualScoreReview
    {
        return DB::transaction(function () use ($dto, $organizationId, $userId) {
            $review = new ManualScoreReview();
            
            // Important: Manual score changes must never overwrite existing versions.
            // Always create new version via ResultService
            
            $this->createAudit(0, 'MANUAL_OVERRIDE', 'Manual score review updated', $organizationId, $userId);
            
            return $review;
        });
    }

    private function createAudit(int $resultId, string $type, string $description, int $organizationId, int $userId): void
    {
        // Audit persistence logic
    }
}
