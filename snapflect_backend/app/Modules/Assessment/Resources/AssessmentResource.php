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
                'assessment_code' => $this->assessment_code,
                'assessment_name' => $this->assessment_name,
                'current_state' => $this->current_state,
                'estimated_duration_minutes' => $this->estimated_duration_minutes,
                'total_marks' => $this->total_marks,
                'pass_percentage' => $this->pass_percentage,
                'is_randomized' => $this->is_randomized,
                'description' => $this->description,
                'is_published' => $this->is_published,
                'status' => $this->status,
            ],

            'relationships' => [
                'category' => AssessmentCategoryResource::make($this->whenLoaded('category')),
                'type' => AssessmentTypeResource::make($this->whenLoaded('type')),
                'versions' => AssessmentVersionResource::collection($this->whenLoaded('versions')),
                'blueprint' => AssessmentBlueprintResource::make($this->whenLoaded('blueprint')),
                'reviews' => AssessmentReviewResource::collection($this->whenLoaded('reviews')),
                'publications' => AssessmentPublicationResource::collection($this->whenLoaded('publications')),
            ],

            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
