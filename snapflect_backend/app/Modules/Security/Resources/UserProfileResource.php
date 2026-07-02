<?php

declare(strict_types=1);

namespace App\Modules\Security\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'attributes' => [
                'user_id' => $this->user_id,
                'profile_photo_url' => $this->profile_photo_url,
                'company' => $this->company,
                'designation' => $this->designation,
                'years_of_experience' => $this->years_of_experience,
                'technology_expertise' => $this->technology_expertise,
                'country' => $this->country,
                'state' => $this->state,
                'city' => $this->city,
                'bio' => $this->bio,
                'profile_completion_percentage' => $this->profile_completion_percentage,
                'is_deleted' => $this->is_deleted,
            ],
            'relationships' => [
                'user' => new UserResource($this->whenLoaded('user')),
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
                'modified_date' => $this->modified_date,
                'deleted_date' => $this->deleted_date,
            ],
        ];
    }
}
