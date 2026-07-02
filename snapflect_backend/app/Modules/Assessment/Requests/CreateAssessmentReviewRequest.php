<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Assessment\DTOs\CreateAssessmentReviewDto;

class CreateAssessmentReviewRequest extends FormRequest
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
            'review_status' => ['required', 'string'],
            'review_comments' => ['nullable', 'string', 'max:5000']
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

    public function toDto(): CreateAssessmentReviewDto
    {
        return CreateAssessmentReviewDto::fromArray($this->validated());
    }
}
