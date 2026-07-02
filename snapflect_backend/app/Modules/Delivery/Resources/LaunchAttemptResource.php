<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Modules\Delivery\Helpers\SnapshotLabelMapper;

class LaunchAttemptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'attemptUuid' => $this->resource->attemptUuid,
            'snapshotUuid' => $this->resource->snapshotUuid,
            'randomizationSeed' => $this->resource->randomizationSeed,
            'questionOrder' => $this->resource->questionOrder,
            'optionOrder' => $this->resource->optionOrder,
            'startedAt' => $this->resource->startedAt,
            'expiresAt' => $this->resource->expiresAt,
            'snapshotMap' => $this->resource->snapshotJson
                ? SnapshotLabelMapper::fromJson($this->resource->snapshotJson)
                : ['questions' => [], 'options' => []],
        ];
    }
}
