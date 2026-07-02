<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentPublicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $computedStatus = $this->status;
        $now = now();

        if ($this->status === 'SCHEDULED' || $this->status === 'ACTIVE') {
            if ($this->end_date && $now->greaterThan($this->end_date)) {
                $computedStatus = 'COMPLETED';
            } elseif ($this->start_date && $now->greaterThanOrEqualTo($this->start_date)) {
                $computedStatus = 'ACTIVE';
            } else {
                $computedStatus = 'SCHEDULED';
            }
        }

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            
            'attributes' => [
                'publication_code' => $this->publication_code,
                'title' => $this->title,
                'status' => $computedStatus,
                'start_date' => $this->start_date,
                'end_date' => $this->end_date,
                'max_attempts' => $this->max_attempts,
                'is_proctored' => $this->is_proctored,
                'published_by' => $this->published_by,
                'published_date' => $this->published_date,
                'publication_notes' => $this->publication_notes,
            ],

            'relationships' => [
                'assessment' => AssessmentResource::make($this->whenLoaded('assessment')),
                'version' => AssessmentVersionResource::make($this->whenLoaded('version')),
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
