<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AttemptSectionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->uuid,
            'uuid' => $this->uuid,
            'attributes' => [
                'section_name' => $this->section_name,
                'display_order' => $this->display_order,
                'total_questions' => $this->total_questions,
                'answered_questions' => $this->answered_questions,
                'flagged_questions' => $this->flagged_questions,
                'started_at' => $this->started_at,
                'completed_at' => $this->completed_at,
            ],
            'relationships' => [
                'questions' => AttemptQuestionResource::collection($this->whenLoaded('questions')),
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
