<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\CreateCompetencyGroupDto;

class CreateCompetencyGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is explicitly handled by Policies.
        return true;
    }

    public function rules(): array
    {
        return [
            'group_code' => ['required', 'string', 'max:50'],
            'group_name' => ['required', 'string', 'max:255'],
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

    public function toDto(): CreateCompetencyGroupDto
    {
        return CreateCompetencyGroupDto::fromArray($this->validated());
    }
}
