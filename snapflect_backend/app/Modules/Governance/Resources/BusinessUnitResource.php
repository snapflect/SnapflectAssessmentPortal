<?php

declare(strict_types=1);

namespace App\Modules\Governance\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusinessUnitResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'attributes' => [
                'organization_id' => $this->organization_id,
                'business_unit_code' => $this->business_unit_code,
                'business_unit_name' => $this->business_unit_name,
                'status' => $this->status,
                'is_deleted' => $this->is_deleted,
            ],
            'relationships' => [
                'organization' => new OrganizationResource($this->whenLoaded('organization')),
                'departments_count' => $this->whenCounted('departments'),
                'users_count' => $this->whenCounted('users'),
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
