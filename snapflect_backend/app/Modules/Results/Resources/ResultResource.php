<?php

declare(strict_types=1);

namespace App\Modules\Results\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResultResource extends JsonResource
{
    /**
     * @param Request $request
     * @return array
     */
    public function toArray($request): array
    {
        return [
            'attemptUuid' => $this->assessmentAttempt->uuid ?? null,
            'assessmentUuid' => $this->assessment->uuid ?? null,
            'status' => $this->status,
            'rawScore' => (float) $this->overall_score,
            'maxPossibleScore' => (float) $this->overall_score, // Need to compute or store max_score on results table if missing
            'percentage' => (float) $this->overall_percentage,
            'passFailStatus' => $this->pass_fail_status,
            'scoredAt' => $this->calculated_at ? $this->calculated_at->toIso8601String() : null,
        ];
    }
}
