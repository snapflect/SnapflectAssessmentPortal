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
                'major_version' => $this->major_version,
                'minor_version' => $this->minor_version,
                'version_label' => $this->version_label,
                'change_summary' => $this->change_summary,
                'published_date' => $this->published_date,
                'status' => $this->status,
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
