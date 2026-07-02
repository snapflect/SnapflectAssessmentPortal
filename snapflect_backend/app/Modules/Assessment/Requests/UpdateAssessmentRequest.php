<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\UpdateAssessmentDto;

class UpdateAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is explicitly handled by Policies.
        return true;
    }

    public function rules(): array
    {
        return [
            'assessment_name' => ['sometimes', 'string', 'max:255'],
            'assessment_category_uuid' => ['sometimes', 'uuid'],
            'assessment_type_uuid' => ['sometimes', 'uuid'],
            'estimated_duration_minutes' => ['sometimes', 'integer', 'min:1'],
            'total_marks' => ['sometimes', 'numeric', 'min:0'],
            'pass_percentage' => ['sometimes', 'numeric', 'between:0,100'],
            'is_randomized' => ['sometimes', 'boolean'],
            'description' => ['sometimes', 'string', 'max:5000']
        ];
    }

    public function messages(): array
    {
        return [

        ];
    }

    public function attributes(): array
    {
        return [

        ];
    }

    public function toDto(): UpdateAssessmentDto
    {
        return UpdateAssessmentDto::fromArray($this->validated());
    }
}
