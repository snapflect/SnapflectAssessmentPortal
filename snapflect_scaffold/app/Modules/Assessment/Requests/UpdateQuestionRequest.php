<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\UpdateQuestionDto;

class UpdateQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is explicitly handled by Policies.
        return true;
    }

    public function rules(): array
    {
        return [
            'question_type' => ['sometimes', 'string'],\n            'difficulty_level' => ['sometimes', 'string'],\n            'question_text' => ['sometimes', 'string', 'max:5000'],\n            'explanation' => ['sometimes', 'string', 'max:5000'],\n            'max_score' => ['sometimes', 'numeric', 'min:0'],\n            'options' => ['sometimes', 'array', 'min:1'],\n            'options.*.option_text' => ['required_with:options', 'string'],\n            'options.*.display_order' => ['required_with:options', 'integer'],\n            'options.*.is_correct' => ['required_with:options', 'boolean'],\n            'status' => ['sometimes', 'string']
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

    public function toDto(): UpdateQuestionDto
    {
        return UpdateQuestionDto::fromArray($this->validated());
    }
}
