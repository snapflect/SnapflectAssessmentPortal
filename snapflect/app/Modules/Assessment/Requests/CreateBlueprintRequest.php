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
            'assessment_uuid' => ['required', 'uuid'],\n            'blueprint_name' => ['required', 'string', 'max:255'],\n            'description' => ['nullable', 'string', 'max:5000'],\n            'sections' => ['required', 'array', 'min:1'],\n            'sections.*.section_name' => ['required', 'string'],\n            'sections.*.display_order' => ['required', 'integer'],\n            'sections.*.section_weight' => ['required', 'numeric', 'min:0', 'max:100'],\n            'sections.*.selection_strategy' => ['required', 'string'],\n            'sections.*.rules' => ['nullable', 'array'],\n            'sections.*.rules.*.question_count' => ['required_with:sections.*.rules', 'integer', 'min:1'],\n            'sections.*.rules.*.difficulty_level' => ['nullable', 'string'],\n            'sections.*.rules.*.tag_uuid' => ['nullable', 'uuid'],\n            'sections.*.rules.*.competency_uuid' => ['nullable', 'uuid'],\n            'sections.*.questions' => ['nullable', 'array'],\n            'sections.*.questions.*.question_uuid' => ['required_with:sections.*.questions', 'uuid'],\n            'sections.*.questions.*.display_order' => ['required_with:sections.*.questions', 'integer']
        ];
    }

    public function messages(): array
    {
        return [
            'sections.required' => 'A blueprint must contain at least one section.',\n            'sections.*.section_weight.max' => 'A section weight cannot exceed 100%.'
        ];
    }

    public function attributes(): array
    {
        return [
            'sections.*.section_name' => 'section name',\n            'sections.*.rules.*.question_count' => 'rule question count'
        ];
    }

    public function toDto(): CreateBlueprintDto
    {
        return CreateBlueprintDto::fromArray($this->validated());
    }
}
