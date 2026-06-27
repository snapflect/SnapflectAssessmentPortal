<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TimerStatusResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'attemptUuid' => $this->resource->attemptUuid,
            'remainingSeconds' => $this->resource->remainingSeconds,
            'expiresAt' => $this->resource->expiresAt,
            'serverTime' => $this->resource->serverTime,
            'expired' => $this->resource->expired,
            'status' => $this->resource->status,
        ];
    }
}
