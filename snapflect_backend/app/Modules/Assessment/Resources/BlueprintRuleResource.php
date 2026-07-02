<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlueprintRuleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            
            'attributes' => [
                'difficulty_level' => $this->difficulty_level,
                'question_type' => $this->question_type,
                'question_count' => $this->question_count,
                'points_per_question' => $this->points_per_question,
            ],

            'relationships' => [
                'tag' => QuestionTagResource::make($this->whenLoaded('tag')),
                'competency' => CompetencyResource::make($this->whenLoaded('competency')),
            ],

            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
