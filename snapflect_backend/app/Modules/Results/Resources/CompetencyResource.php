<?php

declare(strict_types=1);

namespace App\Modules\Results\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompetencyResource extends JsonResource
{
    /**
     * @param Request $request
     * @return array
     */
    public function toArray($request): array
    {
        return [
            'competencyUuid' => $this->competency->uuid ?? null,
            'competencyName' => $this->competency->name ?? null,
            'score' => (float) $this->awarded_score,
            'maxScore' => (float) $this->max_score,
            'percentage' => (float) $this->percentage,
            'passed' => $this->pass_fail_status === 'PASS',
        ];
    }
}
