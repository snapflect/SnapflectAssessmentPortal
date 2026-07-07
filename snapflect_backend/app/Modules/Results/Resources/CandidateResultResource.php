<?php

declare(strict_types=1);

namespace App\Modules\Results\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CandidateResultResource extends JsonResource
{
    /**
     * @param Request $request
     * @return array
     */
    public function toArray($request): array
    {
        // Visibility Governance is enforced here.
        // We assume $this->blueprint holds the snapshot configuration.
        $scoreVisibility = $this->blueprint['score_visibility'] ?? false;
        $passFailVisibility = $this->blueprint['pass_fail_visibility'] ?? false;

        return [
            'resultUuid' => $this->uuid,
            'assessmentName' => $this->assessment_name ?? null,
            'calculatedAt' => $this->calculated_at 
                ? \Carbon\Carbon::parse($this->calculated_at)->toIso8601String() 
                : ($this->published_at ? \Carbon\Carbon::parse($this->published_at)->toIso8601String() : null),
            'resultVersion' => (int) $this->result_version,
            'score' => $scoreVisibility ? (float) $this->overall_score : null,
            'percentage' => $scoreVisibility ? (float) $this->overall_percentage : null,
            'passFailStatus' => $passFailVisibility ? $this->pass_fail_status : null,
        ];
    }
}
