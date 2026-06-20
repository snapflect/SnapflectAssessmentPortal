<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Delivery\DTOs\AutoSaveAnswerDto;

class AutoSaveAnswerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'attempt_uuid' => ['required', 'uuid'],
            'attempt_question_uuid' => ['required', 'uuid'],
            'answer_json' => ['required', 'array'],
            'answer_version' => ['required', 'integer', 'min:1'],
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

    public function toDto(): AutoSaveAnswerDto
    {
        return new AutoSaveAnswerDto(
            $this->validated('attempt_uuid'),
            $this->validated('attempt_question_uuid'),
            $this->validated('answer_json'),
            now()->toDateTimeString(),
            (int) $this->validated('answer_version')
        );
    }

}
