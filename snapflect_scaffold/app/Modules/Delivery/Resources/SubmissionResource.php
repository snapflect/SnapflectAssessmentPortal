<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubmissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'attemptUuid' => $this->resource->attemptUuid,
            'submissionUuid' => $this->resource->submissionUuid ?? null,
            'submittedAt' => $this->resource->submittedAt,
            'finalStatus' => $this->resource->finalStatus,
            'answeredQuestions' => $this->resource->answeredQuestions,
            'totalQuestions' => $this->resource->totalQuestions,
            'completionPercentage' => $this->resource->completionPercentage,
        ];
    }
}
