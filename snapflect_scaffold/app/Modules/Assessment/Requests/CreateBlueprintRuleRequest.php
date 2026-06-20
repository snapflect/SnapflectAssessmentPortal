<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\CreateBlueprintRuleDto;

class CreateBlueprintRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is explicitly handled by Policies.
        return true;
    }

    public function rules(): array
    {
        return [
            'difficulty_level' => ['nullable', 'string'],\n            'tag_uuid' => ['nullable', 'uuid'],\n            'competency_uuid' => ['nullable', 'uuid'],\n            'question_count' => ['required', 'integer', 'min:1']
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

    public function toDto(): CreateBlueprintRuleDto
    {
        return CreateBlueprintRuleDto::fromArray($this->validated());
    }
}
