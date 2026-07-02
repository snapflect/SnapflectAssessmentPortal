<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ValidationResultResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'assessment_uuid' => $this->assessmentUuid,
            'is_valid' => $this->isValid,
            'ready_for_publication' => $this->readyForPublication,
            'validation_errors' => array_map(function ($error) {
                return [
                    'rule' => $error->rule,
                    'message' => $error->message,
                ];
            }, $this->validationErrors),
            'validated_at' => $this->validatedAt,
        ];
    }
}
