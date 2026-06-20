<?php

declare(strict_types=1);

namespace App\Modules\Results\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentResultResource extends JsonResource
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
            'result_reference' => $this->result_reference,
            'result_version' => $this->result_version,
            'overall_score' => $this->overall_score,
            'overall_percentage' => $this->overall_percentage,
            'pass_fail_status' => $this->pass_fail_status,
            'result_status' => $this->result_status,
            'published_at' => $this->published_at,
            ],
            'relationships' => [
            'question_scores' => QuestionScoreResource::collection($this->whenLoaded('questionScores')),
            'section_scores' => SectionScoreResource::collection($this->whenLoaded('sectionScores')),
            'competency_scores' => CompetencyScoreResource::collection($this->whenLoaded('competencyScores')),
            'publications' => ResultPublicationResource::collection($this->whenLoaded('resultPublications')),
            ],
            'timestamps' => [
                'created_date' => $this->whenNotNull($this->created_date ?? null),
                'modified_date' => $this->whenNotNull($this->modified_date ?? null),
                'deleted_date' => $this->whenNotNull($this->deleted_date ?? null),
            ],
        ];
    }
}
