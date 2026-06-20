<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\CreateBlueprintSectionDto;

class CreateBlueprintSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is explicitly handled by Policies.
        return true;
    }

    public function rules(): array
    {
        return [
            'section_name' => ['required', 'string'],\n            'display_order' => ['required', 'integer'],\n            'section_duration_minutes' => ['nullable', 'integer'],\n            'section_weight' => ['nullable', 'numeric'],\n            'selection_strategy' => ['required', 'string'],\n            'rules' => ['nullable', 'array'],\n            'questions' => ['nullable', 'array']
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

    public function toDto(): CreateBlueprintSectionDto
    {
        return CreateBlueprintSectionDto::fromArray($this->validated());
    }
}
