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
                'question_code' => $this->question_code,\n                'question_type' => $this->question_type,\n                'difficulty_level' => $this->difficulty_level,\n                'question_text' => $this->question_text,\n                'explanation' => $this->explanation,\n                'max_score' => $this->max_score,\n                'status' => $this->status,
            ],

            'relationships' => [
                'bank' => QuestionBankResource::make($this->whenLoaded('bank')),\n                'options' => QuestionOptionResource::collection($this->whenLoaded('options')),\n                'tags' => QuestionTagResource::collection($this->whenLoaded('tags')),\n                'competencies' => CompetencyResource::collection($this->whenLoaded('competencies')),
            ],

            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
