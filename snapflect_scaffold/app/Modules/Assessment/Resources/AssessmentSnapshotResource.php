<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentSnapshotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            
            'attributes' => [
                'snapshot_hash' => $this->snapshot_hash,
                'published_by' => $this->published_by,
                'published_date' => $this->published_date,
                'status' => $this->status,
            ],

            'relationships' => [
                'assessment' => AssessmentResource::make($this->whenLoaded('assessment')),
                'version' => AssessmentVersionResource::make($this->whenLoaded('version')),
            ],

            'timestamps' => [
                'created_date' => $this->created_date,
            ],
        ];
    }
}
