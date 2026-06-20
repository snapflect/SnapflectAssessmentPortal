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
                'difficulty_level' => $this->difficulty_level,\n                'question_count' => $this->question_count,
            ],

            'relationships' => [
                'tag' => QuestionTagResource::make($this->whenLoaded('tag')),\n                'competency' => CompetencyResource::make($this->whenLoaded('competency')),
            ],

            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
