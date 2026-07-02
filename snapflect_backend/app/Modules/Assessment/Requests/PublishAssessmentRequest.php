<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\PublishAssessmentDto;

class PublishAssessmentRequest extends FormRequest
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
            'publication_notes' => ['nullable', 'string', 'max:5000']
        ];
    }

    public function messages(): array
    {
        return [
            'publication_notes.max' => 'Publication notes cannot exceed 5000 characters.'
        ];
    }

    public function attributes(): array
    {
        return [

        ];
    }

    public function toDto(): PublishAssessmentDto
    {
        return PublishAssessmentDto::fromArray($this->validated());
    }
}
