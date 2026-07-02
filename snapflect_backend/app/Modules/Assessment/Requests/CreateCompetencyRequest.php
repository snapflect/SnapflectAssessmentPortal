<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\CreateCompetencyDto;

class CreateCompetencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is explicitly handled by Policies.
        return true;
    }

    public function rules(): array
    {
        return [
            'group_uuid' => ['nullable', 'uuid'],
            'competency_code' => ['required', 'string', 'max:50'],
            'competency_name' => ['required', 'string', 'max:255'],
            'proficiency_level' => ['nullable', 'string', 'max:50'],
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

    public function toDto(): CreateCompetencyDto
    {
        return CreateCompetencyDto::fromArray($this->validated());
    }
}
