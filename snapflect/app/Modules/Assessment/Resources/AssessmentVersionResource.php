<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentVersionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            
            'attributes' => [
                'major_version' => $this->major_version,\n                'minor_version' => $this->minor_version,\n                'version_label' => $this->version_label,\n                'change_summary' => $this->change_summary,\n                'published_date' => $this->published_date,\n                'status' => $this->status,
            ],

            'relationships' => [
                'parent_version' => AssessmentVersionResource::make($this->whenLoaded('parentVersion')),
            ],

            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
