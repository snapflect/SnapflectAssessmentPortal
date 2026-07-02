<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\CloneAssessmentDto;

class CloneAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is explicitly handled by Policies.
        return true;
    }

    public function rules(): array
    {
        return [
            'assessment_uuid' => ['required', 'uuid'],
            'change_summary' => ['required', 'string', 'max:5000']
        ];
    }

    public function messages(): array
    {
        return [
            'change_summary.required' => 'A change summary is mandatory when cloning an assessment version.'
        ];
    }

    public function attributes(): array
    {
        return [

        ];
    }

    public function toDto(): CloneAssessmentDto
    {
        return CloneAssessmentDto::fromArray($this->validated());
    }
}
