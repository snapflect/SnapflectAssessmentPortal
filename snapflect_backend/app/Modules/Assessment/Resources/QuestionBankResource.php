<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionBankResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            
            'attributes' => [
                'bank_code' => $this->bank_code,
                'bank_name' => $this->bank_name,
                'is_system_bank' => $this->is_system_bank,
                'description' => $this->description,
                'status' => $this->status,
            ],

            'relationships' => [
                'organization' => \App\Modules\Governance\Resources\OrganizationResource::make($this->whenLoaded('organization')),
            ],

            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
