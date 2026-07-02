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
                'title' => $this->section_name,
                'description' => $this->description,
                'display_order' => $this->display_order,
                'time_limit_minutes' => $this->section_duration_minutes,
                'section_weight' => $this->section_weight,
                'selection_strategy' => $this->selection_strategy,
            ],

            'relationships' => [
                'rules' => BlueprintRuleResource::collection($this->whenLoaded('rules')),
                'sectionQuestions' => BlueprintSectionQuestionResource::collection($this->whenLoaded('sectionQuestions')),
            ],

            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
