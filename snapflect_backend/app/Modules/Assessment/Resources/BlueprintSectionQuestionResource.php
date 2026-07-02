<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlueprintSectionQuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            
            'attributes' => [
                'display_order' => $this->display_order,
            ],

            'relationships' => [
                'question' => QuestionResource::make($this->whenLoaded('question')),
            ],

            'timestamps' => [
                'created_date' => $this->created_date,
            ],
        ];
    }
}
