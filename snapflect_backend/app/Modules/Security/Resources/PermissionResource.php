<?php

declare(strict_types=1);

namespace App\Modules\Security\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'attributes' => [
                'permission_code' => $this->permission_code,
                'module' => $this->module,
                'description' => $this->description,
                'status' => $this->status,
                'is_deleted' => $this->is_deleted,
            ],
            'relationships' => [
                'roles_count' => $this->whenCounted('roles'),
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
