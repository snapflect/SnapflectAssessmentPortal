<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\UpdateBlueprintRuleDto;

class UpdateBlueprintRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is explicitly handled by Policies.
        return true;
    }

    public function rules(): array
    {
        return [
            'difficulty_level' => ['sometimes', 'string'],
            'question_count' => ['sometimes', 'integer', 'min:1']
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

    public function toDto(): UpdateBlueprintRuleDto
    {
        return UpdateBlueprintRuleDto::fromArray($this->validated());
    }
}
