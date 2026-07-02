<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\CreateBlueprintSectionDto;

class CreateBlueprintSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'display_order' => ['required', 'integer'],
            'time_limit_minutes' => ['nullable', 'integer'],
            'section_weight' => ['nullable', 'numeric'],
            'selection_strategy' => ['required', 'string'],
            'rules' => ['nullable', 'array'],
            'questions' => ['nullable', 'array']
        ];
    }

    public function toDto(): CreateBlueprintSectionDto
    {
        $validated = $this->validated();
        
        return CreateBlueprintSectionDto::fromArray([
            'section_name' => $validated['title'] ?? null,
            'description' => $validated['description'] ?? null,
            'display_order' => $validated['display_order'] ?? null,
            'section_duration_minutes' => $validated['time_limit_minutes'] ?? null,
            'section_weight' => $validated['section_weight'] ?? null,
            'selection_strategy' => $validated['selection_strategy'] ?? null,
            'rules' => $validated['rules'] ?? null,
            'questions' => $validated['questions'] ?? null,
        ]);
    }
}
