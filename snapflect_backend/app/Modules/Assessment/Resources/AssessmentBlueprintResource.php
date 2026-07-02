<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentBlueprintResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            
            'attributes' => [
                'blueprint_code' => 'BP-' . strtoupper(substr($this->uuid, 0, 8)),
                'title' => $this->blueprint_name,
                'description' => $this->description,
                'status' => $this->status,
            ],

            'relationships' => [
                'sections' => BlueprintSectionResource::collection($this->whenLoaded('sections')),
                'assessment' => $this->whenLoaded('assessment', function () {
                    return [
                        'uuid' => $this->assessment->uuid,
                        'attributes' => [
                            'title' => $this->assessment->assessment_name,
                        ]
                    ];
                }),
            ],

            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
            ],
        ];
    }
}
