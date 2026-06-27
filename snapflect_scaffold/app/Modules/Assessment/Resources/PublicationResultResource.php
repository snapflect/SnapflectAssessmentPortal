<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicationResultResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'assessment_uuid' => $this->assessmentUuid,
            'previous_status' => $this->previousStatus,
            'current_status' => $this->currentStatus,
            'transitioned_at' => $this->transitionedAt,
            'transitioned_by_uuid' => $this->transitionedByUuid,
        ];
    }
}
