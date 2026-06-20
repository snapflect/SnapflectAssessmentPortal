<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AttemptQuestionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->uuid,
            'uuid' => $this->uuid,
            'attributes' => [
                'snapshot_question_uuid' => $this->snapshot_question_uuid,
                'question_code' => $this->question_code,
                'question_type' => $this->question_type,
                'difficulty_level' => $this->difficulty_level,
                'display_order' => $this->display_order,
                'max_score' => $this->max_score,
                'is_flagged' => $this->is_flagged,
                'viewed_at' => $this->viewed_at,
                'answered_at' => $this->answered_at,
            ],
            'relationships' => [
                'answers' => CandidateAnswerResource::collection($this->whenLoaded('answers')),
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
