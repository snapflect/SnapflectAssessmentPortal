<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\UpdateBlueprintSectionDto;

class UpdateBlueprintSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is explicitly handled by Policies.
        return true;
    }

    public function rules(): array
    {
        return [
            'section_name' => ['sometimes', 'string'],\n            'display_order' => ['sometimes', 'integer'],\n            'selection_strategy' => ['sometimes', 'string']
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

    public function toDto(): UpdateBlueprintSectionDto
    {
        return UpdateBlueprintSectionDto::fromArray($this->validated());
    }
}
