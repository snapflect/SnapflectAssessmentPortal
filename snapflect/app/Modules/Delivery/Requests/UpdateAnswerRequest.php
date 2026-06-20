<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Delivery\DTOs\UpdateAnswerDto;

class UpdateAnswerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'answer_uuid' => ['required', 'uuid'],
            'answer_type' => ['required', 'string', 'in:SINGLE_CHOICE,MULTIPLE_CHOICE,TRUE_FALSE,SHORT_TEXT,LONG_TEXT,NUMERIC'],
            'selected_option_uuid' => ['nullable', 'uuid'],
            'selected_option_uuids_json' => ['nullable', 'array'],
            'text_answer' => ['nullable', 'string'],
            'numeric_answer' => ['nullable', 'numeric'],
            'answer_json' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'The :attribute field is required.',
            'uuid' => 'The :attribute must be a valid UUID.',
            'boolean' => 'The :attribute must be true or false.',
            'in' => 'The :attribute must be one of the following types: :values',
        ];
    }

    public function attributes(): array
    {
        return [
            'assessment_uuid' => 'Assessment',
            'session_uuid' => 'Session',
            'attempt_uuid' => 'Attempt',
            'attempt_question_uuid' => 'Question',
            'answer_uuid' => 'Answer',
            'answer_type' => 'Answer Type',
            'answer_json' => 'Answer Payload',
        ];
    }

    public function toDto(): UpdateAnswerDto
    {
        return new UpdateAnswerDto(
            $this->validated('answer_uuid'),
            $this->validated('answer_type'),
            $this->validated('selected_option_uuid'),
            $this->validated('selected_option_uuids_json'),
            $this->validated('text_answer'),
            $this->validated('numeric_answer') ? (float) $this->validated('numeric_answer') : null,
            $this->validated('answer_json')
        );
    }

}
