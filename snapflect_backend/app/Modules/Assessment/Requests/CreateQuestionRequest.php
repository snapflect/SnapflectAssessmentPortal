<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\CreateQuestionDto;
use Illuminate\Validation\Rule;

class CreateQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is explicitly handled by Policies.
        return true;
    }

    public function rules(): array
    {
        return [
            'question_bank_uuid' => ['required', 'uuid'],
            'question_code' => ['required', 'string', 'max:50'],
            'question_type' => ['required', 'string'],
            'difficulty_level' => ['required', 'string'],
            'question_text' => ['required', 'string', 'max:5000'],
            'explanation' => ['nullable', 'string', 'max:5000'],
            'max_score' => ['required', 'numeric', 'min:0'],
            'options' => [
                Rule::requiredIf($this->input('question_type') !== 'ESSAY'),
                'array',
                Rule::when($this->input('question_type') !== 'ESSAY', ['min:1'])
            ],
            'options.*.option_text' => ['required', 'string'],
            'options.*.display_order' => ['required', 'integer'],
            'options.*.is_correct' => ['required', 'boolean'],
            'competency_uuids' => ['nullable', 'array'],
            'competency_uuids.*' => ['uuid'],
            'tag_uuids' => ['nullable', 'array'],
            'tag_uuids.*' => ['uuid']
        ];
    }

    public function messages(): array
    {
        return [
            'options.min' => 'You must provide at least one answer option.'
        ];
    }

    public function attributes(): array
    {
        return [

        ];
    }

    public function toDto(): CreateQuestionDto
    {
        return CreateQuestionDto::fromArray($this->validated());
    }
}
