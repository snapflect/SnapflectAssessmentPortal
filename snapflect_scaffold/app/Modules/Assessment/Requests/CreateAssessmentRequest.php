<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\CreateAssessmentDto;

class CreateAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is explicitly handled by Policies.
        return true;
    }

    public function rules(): array
    {
        return [
            'assessment_code' => ['required', 'string', 'max:50'],\n            'assessment_name' => ['required', 'string', 'max:255'],\n            'assessment_category_uuid' => ['required', 'uuid'],\n            'assessment_type_uuid' => ['required', 'uuid'],\n            'template_uuid' => ['nullable', 'uuid'],\n            'estimated_duration_minutes' => ['nullable', 'integer', 'min:1'],\n            'total_marks' => ['nullable', 'numeric', 'min:0'],\n            'pass_percentage' => ['nullable', 'numeric', 'between:0,100'],\n            'description' => ['nullable', 'string', 'max:5000']
        ];
    }

    public function messages(): array
    {
        return [
            'assessment_code.required' => 'The assessment code is mandatory.'
        ];
    }

    public function attributes(): array
    {
        return [
            'assessment_category_uuid' => 'assessment category'
        ];
    }

    public function toDto(): CreateAssessmentDto
    {
        return CreateAssessmentDto::fromArray($this->validated());
    }
}
