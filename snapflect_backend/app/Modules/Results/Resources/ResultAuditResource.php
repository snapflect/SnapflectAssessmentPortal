<?php

declare(strict_types=1);

namespace App\Modules\Results\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResultAuditResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'uuid' => $this->uuid,
            'attributes' => [
            'audit_type' => $this->audit_type,
            'audit_description' => $this->audit_description,
            'performed_at' => $this->performed_at,
            ],
            'relationships' => [
            ],
            'timestamps' => [
                'created_date' => $this->whenNotNull($this->created_date ?? null),
                'modified_date' => $this->whenNotNull($this->modified_date ?? null),
                'deleted_date' => $this->whenNotNull($this->deleted_date ?? null),
            ],
        ];
    }
}
