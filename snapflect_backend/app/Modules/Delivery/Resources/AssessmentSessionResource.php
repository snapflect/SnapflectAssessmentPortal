<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentSessionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->uuid,
            'uuid' => $this->uuid,
            'attributes' => [
                'session_status' => $this->session_status,
                'access_started_at' => $this->access_started_at,
                'access_expires_at' => $this->access_expires_at,
                'last_activity_at' => $this->last_activity_at,
            ],
            'relationships' => [
                'attempt' => new AssessmentAttemptResource($this->whenLoaded('attempt')),
                'candidate' => $this->whenLoaded('candidate', fn() => ['uuid' => $this->candidate->uuid]),
                'assessment' => $this->whenLoaded('assessment', fn() => ['uuid' => $this->assessment->uuid]),
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
