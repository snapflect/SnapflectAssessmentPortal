<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\CreateQuestionBankDto;
use Illuminate\Validation\Rule;

class CreateQuestionBankRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is explicitly handled by Policies.
        return true;
    }

    public function rules(): array
    {
        return [
            'organization_id' => ['nullable', 'integer'],
            'bank_code' => ['nullable', 'string', 'max:50', Rule::unique('question_banks')->whereNull('deleted_date')],
            'bank_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000']
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

    public function toDto(): CreateQuestionBankDto
    {
        return CreateQuestionBankDto::fromArray($this->validated());
    }
}
