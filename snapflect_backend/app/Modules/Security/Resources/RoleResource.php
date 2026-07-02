<?php

declare(strict_types=1);

namespace App\Modules\Security\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Modules\Governance\Resources\OrganizationResource;

class RoleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'attributes' => [
                'organization_id' => $this->organization_id,
                'role_code' => $this->role_code,
                'role_name' => $this->role_name,
                'description' => $this->description,
                'is_system_role' => $this->is_system_role,
                'status' => $this->status,
                'is_deleted' => $this->is_deleted,
            ],
            'relationships' => [
                'organization' => new OrganizationResource($this->whenLoaded('organization')),
                'permissions' => PermissionResource::collection($this->whenLoaded('permissions')),
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
