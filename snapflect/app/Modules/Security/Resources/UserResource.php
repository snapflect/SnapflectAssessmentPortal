<?php

declare(strict_types=1);

namespace App\Modules\Security\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Modules\Governance\Resources\OrganizationResource;
use App\Modules\Governance\Resources\BusinessUnitResource;
use App\Modules\Governance\Resources\DepartmentResource;
use App\Modules\Governance\Resources\LocationResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'attributes' => [
                'organization_id' => $this->organization_id,
                'business_unit_id' => $this->business_unit_id,
                'department_id' => $this->department_id,
                'location_id' => $this->location_id,
                'first_name' => $this->first_name,
                'last_name' => $this->last_name,
                'email' => $this->email,
                'status' => $this->status,
                'last_login_at' => $this->last_login_at,
                'is_deleted' => $this->is_deleted,
            ],
            'relationships' => [
                'organization' => new OrganizationResource($this->whenLoaded('organization')),
                'business_unit' => new BusinessUnitResource($this->whenLoaded('businessUnit')),
                'department' => new DepartmentResource($this->whenLoaded('department')),
                'location' => new LocationResource($this->whenLoaded('location')),
                'roles' => RoleResource::collection($this->whenLoaded('roles')),
                'user_profile' => new UserProfileResource($this->whenLoaded('userProfile')),
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
