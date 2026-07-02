<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AttemptAuditResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->uuid,
            'uuid' => $this->uuid,
            'attributes' => [
                'entity_name' => $this->entity_name,
                'entity_uuid' => $this->entity_uuid,
                'action_type' => $this->action_type,
                'old_value_json' => $this->old_value_json,
                'new_value_json' => $this->new_value_json,
                'changed_at' => $this->changed_at,
            ],
            'relationships' => [
            ],
            'timestamps' => [
            ],
        ];
    }
}
