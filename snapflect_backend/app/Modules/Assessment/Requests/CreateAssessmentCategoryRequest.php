<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\CreateAssessmentCategoryDto;

class CreateAssessmentCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is explicitly handled by Policies.
        return true;
    }

    public function rules(): array
    {
        return [
            'category_code' => ['nullable', 'string', 'max:50', \Illuminate\Validation\Rule::unique('assessment_categories')->whereNull('deleted_date')],
            'category_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000']
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

    public function toDto(): CreateAssessmentCategoryDto
    {
        return CreateAssessmentCategoryDto::fromArray($this->validated());
    }
}
