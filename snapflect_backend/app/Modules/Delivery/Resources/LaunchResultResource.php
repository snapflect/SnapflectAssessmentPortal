<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LaunchResultResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'attempt_uuid' => $this->attemptUuid,
            'snapshot_uuid' => $this->snapshotUuid,
            'seed' => $this->seed,
            'snapshot_schema_version' => $this->snapshotSchemaVersion,
            'question_randomized' => $this->questionRandomized,
            'option_randomized' => $this->optionRandomized,
            'launched_at' => $this->randomizedAt,
        ];
    }
}
