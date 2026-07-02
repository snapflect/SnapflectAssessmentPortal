<?php

declare(strict_types=1);

namespace App\Modules\Governance\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'attributes' => [
                'organization_id' => $this->organization_id,
                'business_unit_id' => $this->business_unit_id,
                'department_code' => $this->department_code,
                'department_name' => $this->department_name,
                'status' => $this->status,
                'is_deleted' => $this->is_deleted,
            ],
            'relationships' => [
                'organization' => new OrganizationResource($this->whenLoaded('organization')),
                'business_unit' => new BusinessUnitResource($this->whenLoaded('businessUnit')),
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
