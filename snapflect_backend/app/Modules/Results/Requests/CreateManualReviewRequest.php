<?php

declare(strict_types=1);

namespace App\Modules\Results\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Results\DTOs\CreateManualReviewDto;

class CreateManualReviewRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Note: Authorization logic resides purely in the Policy layer.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'result_uuid' => ['required', 'uuid'],
            'question_score_uuid' => ['required', 'uuid'],
            'reviewed_score' => ['required', 'numeric', 'min:0'],
            'review_comments' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'result_uuid.required' => 'A valid Result reference is required.',
            'result_uuid.uuid' => 'The Result identifier must be a valid UUID.',
            'question_score_uuid.required' => 'A Question Score reference is required for targeted review.',
            'question_score_uuid.uuid' => 'The Question Score identifier must be a valid UUID.',
            'reviewed_score.required' => 'The override score is mandatory.',
            'reviewed_score.numeric' => 'The override score must be a number.',
            'reviewed_score.min' => 'The override score cannot be strictly negative.',
            'review_comments.max' => 'Review comments cannot exceed 5000 characters.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'result_uuid' => 'Result',
            'question_score_uuid' => 'Question Score',
            'reviewed_score' => 'Reviewed Score',
            'review_comments' => 'Comments',
        ];
    }

    /**
     * Transform the validated payload directly into an immutable DTO.
     */
    public function toDto(): CreateManualReviewDto
    {
        // Controllers must consume this DTO, avoiding arrays and validated() returns.
        $data = $this->validated();
        
        // Ensure route parameters (if mapped to request) are merged if needed,
        // or just rely on the request merging route params internally before validation.
        return CreateManualReviewDto::fromArray($data);
    }
}
