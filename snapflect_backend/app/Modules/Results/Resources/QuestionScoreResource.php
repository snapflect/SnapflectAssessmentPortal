<?php

declare(strict_types=1);

namespace App\Modules\Results\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionScoreResource extends JsonResource
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
            'max_score' => $this->max_score,
            'awarded_score' => $this->awarded_score,
            'percentage' => $this->percentage,
            'scoring_type' => $this->scoring_type,
            'question_text' => $this->whenLoaded('question', fn() => $this->question->question_text),
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
