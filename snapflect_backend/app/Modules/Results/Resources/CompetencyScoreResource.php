<?php

declare(strict_types=1);

namespace App\Modules\Results\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompetencyScoreResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'uuid' => $this->uuid,
            'attributes' => [
            'competency_score' => $this->competency_score,
            'competency_percentage' => $this->competency_percentage,
            'threshold_score' => $this->threshold_score,
            'competency_status' => $this->competency_status,
            'competency_name' => $this->whenLoaded('competency', fn() => $this->competency->competency_name),
            ],
            'relationships' => [
            ],
            'timestamps' => [
                'created_date' => $this->whenNotNull($this->created_date ?? null),
                'modified_date' => $this->whenNotNull($this->modified_date ?? null),
                'deleted_date' => $this->whenNotNull($this->deleted_date ?? null),
            ],
        ];
    }
}
