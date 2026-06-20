<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            
            'attributes' => [
                'assessment_code' => $this->assessment_code,\n                'assessment_name' => $this->assessment_name,\n                'current_state' => $this->current_state,\n                'estimated_duration_minutes' => $this->estimated_duration_minutes,\n                'total_marks' => $this->total_marks,\n                'pass_percentage' => $this->pass_percentage,\n                'description' => $this->description,\n                'is_published' => $this->is_published,\n                'status' => $this->status,
            ],

            'relationships' => [
                'category' => AssessmentCategoryResource::make($this->whenLoaded('category')),\n                'type' => AssessmentTypeResource::make($this->whenLoaded('type')),\n                'versions' => AssessmentVersionResource::collection($this->whenLoaded('versions')),\n                'blueprint' => AssessmentBlueprintResource::make($this->whenLoaded('blueprint')),\n                'reviews' => AssessmentReviewResource::collection($this->whenLoaded('reviews')),\n                'publications' => AssessmentPublicationResource::collection($this->whenLoaded('publications')),
            ],

            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
