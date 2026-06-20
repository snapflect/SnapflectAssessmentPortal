<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentPublicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            
            'attributes' => [
                'published_by' => $this->published_by,\n                'published_date' => $this->published_date,\n                'publication_notes' => $this->publication_notes,
            ],

            'relationships' => [
                'version' => AssessmentVersionResource::make($this->whenLoaded('version')),\n                'snapshot' => AssessmentSnapshotResource::make($this->whenLoaded('snapshot')),
            ],

            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
