<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\CreateBlueprintDto;

class CreateBlueprintRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is explicitly handled by Policies.
        return true;
    }

    public function rules(): array
    {
        return [
            'assessment_uuid' => ['required', 'uuid'],
            'blueprint_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'sections' => ['required', 'array', 'min:1'],
            'sections.*.section_name' => ['required', 'string'],
            'sections.*.display_order' => ['required', 'integer'],
            'sections.*.section_weight' => ['required', 'numeric', 'min:0', 'max:100'],
            'sections.*.selection_strategy' => ['required', 'string'],
            'sections.*.rules' => ['nullable', 'array'],
            'sections.*.rules.*.question_count' => ['required_with:sections.*.rules', 'integer', 'min:1'],
            'sections.*.rules.*.difficulty_level' => ['nullable', 'string'],
            'sections.*.rules.*.tag_uuid' => ['nullable', 'uuid'],
            'sections.*.rules.*.competency_uuid' => ['nullable', 'uuid'],
            'sections.*.questions' => ['nullable', 'array'],
            'sections.*.questions.*.question_uuid' => ['required_with:sections.*.questions', 'uuid'],
            'sections.*.questions.*.display_order' => ['required_with:sections.*.questions', 'integer']
        ];
    }

    public function messages(): array
    {
        return [
            'sections.required' => 'A blueprint must contain at least one section.',
            'sections.*.section_weight.max' => 'A section weight cannot exceed 100%.'
        ];
    }

    public function attributes(): array
    {
        return [
            'sections.*.section_name' => 'section name',
            'sections.*.rules.*.question_count' => 'rule question count'
        ];
    }

    public function toDto(): CreateBlueprintDto
    {
        return CreateBlueprintDto::fromArray($this->validated());
    }
}
