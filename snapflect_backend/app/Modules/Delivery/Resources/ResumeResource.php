<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Modules\Delivery\Helpers\SnapshotLabelMapper;

class ResumeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'attemptUuid'          => $this->resource->attemptUuid,
            'snapshotUuid'         => $this->resource->snapshotUuid,
            'snapshotSchemaVersion' => $this->resource->snapshotSchemaVersion ?? '1.0',
            'randomizationSeed'    => $this->resource->randomizationSeed,
            'questionOrder'        => $this->resource->questionOrder,
            'optionOrder'          => $this->resource->optionOrder,
            'draftAnswers'         => $this->resource->draftAnswers,
            'remainingSeconds'     => $this->resource->remainingSeconds,
            'expiresAt'            => $this->resource->expiresAt ?? null,
            'serverTime'           => $this->resource->serverTime ?? null,
            'completionPercentage' => $this->resource->completionPercentage,
            'snapshotMap'          => $this->resource->snapshotJson
                ? SnapshotLabelMapper::fromJson($this->resource->snapshotJson)
                : ['questions' => [], 'options' => []],
        ];
    }
}

