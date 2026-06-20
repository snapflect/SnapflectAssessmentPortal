<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\CreateQuestionDto;

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
            'question_bank_uuid' => ['required', 'uuid'],\n            'question_code' => ['required', 'string', 'max:50'],\n            'question_type' => ['required', 'string'],\n            'difficulty_level' => ['required', 'string'],\n            'question_text' => ['required', 'string', 'max:5000'],\n            'explanation' => ['nullable', 'string', 'max:5000'],\n            'max_score' => ['required', 'numeric', 'min:0'],\n            'options' => ['required', 'array', 'min:1'],\n            'options.*.option_text' => ['required', 'string'],\n            'options.*.display_order' => ['required', 'integer'],\n            'options.*.is_correct' => ['required', 'boolean'],\n            'competency_uuids' => ['nullable', 'array'],\n            'competency_uuids.*' => ['uuid'],\n            'tag_uuids' => ['nullable', 'array'],\n            'tag_uuids.*' => ['uuid']
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
