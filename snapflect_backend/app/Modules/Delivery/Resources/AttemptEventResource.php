<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AttemptEventResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->uuid,
            'uuid' => $this->uuid,
            'attributes' => [
                'event_type' => $this->event_type,
                'event_description' => $this->event_description,
                'event_data_json' => $this->event_data_json,
                'event_timestamp' => $this->event_timestamp,
                'ip_address' => $this->when($request->user()?->hasRole('ORGANIZATION_ADMIN') || $request->user()?->hasRole('PLATFORM_ADMIN'), $this->ip_address),
                'user_agent' => $this->when($request->user()?->hasRole('ORGANIZATION_ADMIN') || $request->user()?->hasRole('PLATFORM_ADMIN'), $this->user_agent),
            ],
            'relationships' => [
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
            ],
        ];
    }
}
