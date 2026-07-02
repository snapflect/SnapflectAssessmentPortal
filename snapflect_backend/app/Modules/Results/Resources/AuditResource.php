<?php

declare(strict_types=1);

namespace App\Modules\Results\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditResource extends JsonResource
{
    /**
     * @param Request $request
     * @return array
     */
    public function toArray($request): array
    {
        $payload = is_string($this->new_value_json) ? json_decode($this->new_value_json, true) : $this->new_value_json;
        
        return [
            'auditUuid' => $this->uuid,
            'auditType' => $this->audit_type,
            'description' => $this->audit_description,
            'performedAt' => $this->performed_at ? $this->performed_at->toIso8601String() : null,
            'evaluation' => $payload['evaluation'] ?? null,
            'questionLedger' => $payload['question_ledger'] ?? [],
        ];
    }
}
