<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\CreateQuestionBankDto;

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
            'bank_code' => ['required', 'string', 'max:50'],\n            'bank_name' => ['required', 'string', 'max:255'],\n            'description' => ['nullable', 'string', 'max:5000']
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
