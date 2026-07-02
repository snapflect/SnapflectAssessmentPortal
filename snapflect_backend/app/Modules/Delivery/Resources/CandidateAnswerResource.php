<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CandidateAnswerResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->uuid,
            'uuid' => $this->uuid,
            'attributes' => [
                'answer_type' => $this->answer_type,
                'selected_option_uuid' => $this->selected_option_uuid,
                'selected_option_uuids_json' => $this->selected_option_uuids_json,
                'text_answer' => $this->text_answer,
                'numeric_answer' => $this->numeric_answer,
                'answer_json' => $this->answer_json,
                'answer_version' => $this->answer_version,
                'is_final_answer' => $this->is_final_answer,
                'saved_at' => $this->saved_at,
            ],
            'relationships' => [
                'question' => new AttemptQuestionResource($this->whenLoaded('question')),
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
