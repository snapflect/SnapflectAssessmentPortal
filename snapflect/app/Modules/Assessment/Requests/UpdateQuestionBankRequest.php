<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\UpdateQuestionBankDto;

class UpdateQuestionBankRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is explicitly handled by Policies.
        return true;
    }

    public function rules(): array
    {
        return [
            'bank_name' => ['sometimes', 'string', 'max:255'],\n            'description' => ['sometimes', 'string', 'max:5000'],\n            'status' => ['sometimes', 'string']
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

    public function toDto(): UpdateQuestionBankDto
    {
        return UpdateQuestionBankDto::fromArray($this->validated());
    }
}
