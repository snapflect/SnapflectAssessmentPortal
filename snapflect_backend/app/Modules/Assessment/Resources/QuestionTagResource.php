<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionTagResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'attributes' => [
                'tag_name' => $this->tag_name,
                'status' => $this->status,
            ],
            'timestamps' => [
                'created_date' => $this->created_date,
            ],
        ];
    }
}
