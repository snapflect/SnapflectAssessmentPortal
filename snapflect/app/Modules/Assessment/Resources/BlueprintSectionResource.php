<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlueprintSectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            
            'attributes' => [
                'section_name' => $this->section_name,\n                'display_order' => $this->display_order,\n                'section_duration_minutes' => $this->section_duration_minutes,\n                'section_weight' => $this->section_weight,\n                'selection_strategy' => $this->selection_strategy,
            ],

            'relationships' => [
                'rules' => BlueprintRuleResource::collection($this->whenLoaded('rules')),\n                'questions' => QuestionResource::collection($this->whenLoaded('sectionQuestions')),
            ],

            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
