<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AttemptSubmissionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->uuid,
            'uuid' => $this->uuid,
            'attributes' => [
                'submission_reference' => $this->submission_reference,
                'submission_type' => $this->submission_type,
                'total_answered' => $this->total_answered,
                'total_unanswered' => $this->total_unanswered,
                'final_duration_seconds' => $this->final_duration_seconds,
                'submitted_at' => $this->submitted_at,
            ],
            'relationships' => [
                'attempt' => new AssessmentAttemptResource($this->whenLoaded('attempt')),
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
            ],
        ];
    }
}
