<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AutoSaveResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'questionUuid' => $this->resource->questionUuid ?? null,
            'answerUuid' => $this->resource->answerUuid,
            'serverDraftVersion' => $this->resource->serverDraftVersion,
            'savedAt' => $this->resource->savedAt,
            'success' => $this->resource->success,
        ];
    }
}
