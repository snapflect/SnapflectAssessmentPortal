<?php

declare(strict_types=1);

namespace App\Modules\Results\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Results\DTOs\UpdateManualReviewDto;

class UpdateManualReviewRequest extends FormRequest
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
            'manual_review_uuid' => ['required', 'uuid'],
            'review_status' => ['nullable', 'in:PENDING,IN_REVIEW,COMPLETED'],
            'reviewed_score' => ['nullable', 'numeric', 'min:0'],
            'review_comments' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'manual_review_uuid.required' => 'A valid Manual Review reference is required for updates.',
            'manual_review_uuid.uuid' => 'The Manual Review identifier must be a valid UUID.',
            'review_status.in' => 'The review status must exactly match PENDING, IN_REVIEW, or COMPLETED.',
            'reviewed_score.numeric' => 'The override score must be a number.',
            'reviewed_score.min' => 'The override score cannot be negative.',
            'review_comments.max' => 'Review comments cannot exceed 5000 characters.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'manual_review_uuid' => 'Manual Review',
            'review_status' => 'Status',
            'reviewed_score' => 'Reviewed Score',
            'review_comments' => 'Comments',
        ];
    }

    /**
     * Transform the validated payload directly into an immutable DTO.
     */
    public function toDto(): UpdateManualReviewDto
    {
        // Controllers must consume this DTO, avoiding arrays and validated() returns.
        $data = $this->validated();
        
        // Ensure route parameters (if mapped to request) are merged if needed,
        // or just rely on the request merging route params internally before validation.
        return UpdateManualReviewDto::fromArray($data);
    }
}
