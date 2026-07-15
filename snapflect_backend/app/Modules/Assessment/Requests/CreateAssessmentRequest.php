<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\CreateAssessmentDto;
use Illuminate\Validation\Rule;

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
            'assessment_code' => ['nullable', 'string', 'max:50', Rule::unique('assessments')->whereNull('deleted_date')],
            'assessment_name' => ['required', 'string', 'max:255'],
            'assessment_category_uuid' => ['required', 'uuid'],
            'assessment_type_uuid' => ['required', 'uuid'],
            'template_uuid' => ['nullable', 'uuid'],
            'estimated_duration_minutes' => ['nullable', 'integer', 'min:1'],
            'total_marks' => ['nullable', 'numeric', 'min:0'],
            'pass_percentage' => ['nullable', 'numeric', 'between:0,100'],
            'is_randomized' => ['nullable', 'boolean'],
            'description' => ['nullable', 'string', 'max:5000']
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
