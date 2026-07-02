<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            
            'attributes' => [
                'question_code' => $this->question_code,
                'question_type' => $this->question_type,
                'difficulty_level' => $this->difficulty_level,
                'question_text' => $this->question_text,
                'explanation' => $this->explanation,
                'max_score' => $this->max_score,
                'status' => $this->status,
            ],

            'relationships' => [
                'questionBank' => QuestionBankResource::make($this->whenLoaded('bank')),
                'options' => QuestionOptionResource::collection($this->whenLoaded('options')),
                'tags' => QuestionTagResource::collection($this->whenLoaded('tags')),
                'competencies' => CompetencyResource::collection($this->whenLoaded('competencies')),
            ],

            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
