<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\UpdateQuestionDto;
use Illuminate\Validation\Rule;

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
            'question_type' => ['sometimes', 'string'],
            'difficulty_level' => ['sometimes', 'string'],
            'question_text' => ['sometimes', 'string', 'max:5000'],
            'explanation' => ['nullable', 'sometimes', 'string', 'max:5000'],
            'max_score' => ['sometimes', 'numeric', 'min:0'],
            'options' => [
                'sometimes',
                'array',
                Rule::when($this->input('question_type') !== 'ESSAY', ['min:1'])
            ],
            'options.*.option_text' => ['required_with:options', 'string'],
            'options.*.display_order' => ['required_with:options', 'integer'],
            'options.*.is_correct' => ['required_with:options', 'boolean'],
            'status' => ['sometimes', 'string'],
            'competency_uuids' => ['nullable', 'array'],
            'competency_uuids.*' => ['uuid'],
            'tag_uuids' => ['nullable', 'array'],
            'tag_uuids.*' => ['uuid']
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
