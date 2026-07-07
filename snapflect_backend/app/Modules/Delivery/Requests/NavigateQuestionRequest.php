<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Delivery\DTOs\NavigateQuestionDto;

class NavigateQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'attempt_uuid' => ['nullable', 'uuid'],
            'current_question' => ['nullable', 'string'],
            'target_question_uuid' => ['nullable', 'uuid'],
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

    public function toDto(): NavigateQuestionDto
    {
        // The frontend passes 'current_question' in the query string
        return new NavigateQuestionDto(
            $this->route('attempt')?->uuid ?? $this->input('attempt_uuid') ?? '',
            $this->input('current_question'),
            $this->input('target_question_uuid')
        );
    }

}
