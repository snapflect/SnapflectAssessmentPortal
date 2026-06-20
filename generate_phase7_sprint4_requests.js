const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'snapflect', 'app', 'Modules', 'Results', 'Requests');
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

const writePhpFile = (filePath, content) => {
    fs.writeFileSync(filePath, content);
};

const requests = [
    {
        name: 'CalculateResultRequest',
        dto: 'CalculateResultDto',
        rules: `
            'attempt_uuid' => ['required', 'uuid'],
            'calculation_reason' => ['nullable', 'string', 'max:1000'],`,
        messages: `
            'attempt_uuid.required' => 'The Attempt identifier is absolutely mandatory to calculate a result.',
            'attempt_uuid.uuid' => 'The Attempt identifier must be a structurally valid UUID.',
            'calculation_reason.max' => 'The calculation reason cannot exceed 1000 characters.',`,
        attributes: `
            'attempt_uuid' => 'Attempt',
            'calculation_reason' => 'Reason',`
    },
    {
        name: 'RecalculateResultRequest',
        dto: 'RecalculateResultDto',
        rules: `
            'result_uuid' => ['required', 'uuid'],
            'recalculation_reason' => ['required', 'string', 'max:1000'],`,
        messages: `
            'result_uuid.required' => 'A valid Result reference is required for recalculation.',
            'result_uuid.uuid' => 'The Result identifier must be a valid UUID.',
            'recalculation_reason.required' => 'You must provide a strict reason to trigger a ledger recalculation.',
            'recalculation_reason.max' => 'The recalculation reason cannot exceed 1000 characters.',`,
        attributes: `
            'result_uuid' => 'Result',
            'recalculation_reason' => 'Reason',`
    },
    {
        name: 'PublishResultRequest',
        dto: 'PublishResultDto',
        rules: `
            'result_uuid' => ['required', 'uuid'],
            'publication_notes' => ['nullable', 'string', 'max:1000'],`,
        messages: `
            'result_uuid.required' => 'A valid Result reference is required for publication.',
            'result_uuid.uuid' => 'The Result identifier must be a valid UUID.',
            'publication_notes.max' => 'Publication notes cannot exceed 1000 characters.',`,
        attributes: `
            'result_uuid' => 'Result',
            'publication_notes' => 'Notes',`
    },
    {
        name: 'ArchiveResultRequest',
        dto: 'ArchiveResultDto',
        rules: `
            'result_uuid' => ['required', 'uuid'],
            'archive_reason' => ['required', 'string', 'max:1000'],`,
        messages: `
            'result_uuid.required' => 'A valid Result reference is required for archiving.',
            'result_uuid.uuid' => 'The Result identifier must be a valid UUID.',
            'archive_reason.required' => 'You must provide a strict reason to archive a published result.',
            'archive_reason.max' => 'The archive reason cannot exceed 1000 characters.',`,
        attributes: `
            'result_uuid' => 'Result',
            'archive_reason' => 'Reason',`
    },
    {
        name: 'CreateManualReviewRequest',
        dto: 'CreateManualReviewDto',
        rules: `
            'result_uuid' => ['required', 'uuid'],
            'question_score_uuid' => ['required', 'uuid'],
            'reviewed_score' => ['required', 'numeric', 'min:0'],
            'review_comments' => ['nullable', 'string', 'max:5000'],`,
        messages: `
            'result_uuid.required' => 'A valid Result reference is required.',
            'result_uuid.uuid' => 'The Result identifier must be a valid UUID.',
            'question_score_uuid.required' => 'A Question Score reference is required for targeted review.',
            'question_score_uuid.uuid' => 'The Question Score identifier must be a valid UUID.',
            'reviewed_score.required' => 'The override score is mandatory.',
            'reviewed_score.numeric' => 'The override score must be a number.',
            'reviewed_score.min' => 'The override score cannot be strictly negative.',
            'review_comments.max' => 'Review comments cannot exceed 5000 characters.',`,
        attributes: `
            'result_uuid' => 'Result',
            'question_score_uuid' => 'Question Score',
            'reviewed_score' => 'Reviewed Score',
            'review_comments' => 'Comments',`
    },
    {
        name: 'UpdateManualReviewRequest',
        dto: 'UpdateManualReviewDto',
        rules: `
            'manual_review_uuid' => ['required', 'uuid'],
            'review_status' => ['nullable', 'in:PENDING,IN_REVIEW,COMPLETED'],
            'reviewed_score' => ['nullable', 'numeric', 'min:0'],
            'review_comments' => ['nullable', 'string', 'max:5000'],`,
        messages: `
            'manual_review_uuid.required' => 'A valid Manual Review reference is required for updates.',
            'manual_review_uuid.uuid' => 'The Manual Review identifier must be a valid UUID.',
            'review_status.in' => 'The review status must exactly match PENDING, IN_REVIEW, or COMPLETED.',
            'reviewed_score.numeric' => 'The override score must be a number.',
            'reviewed_score.min' => 'The override score cannot be negative.',
            'review_comments.max' => 'Review comments cannot exceed 5000 characters.',`,
        attributes: `
            'manual_review_uuid' => 'Manual Review',
            'review_status' => 'Status',
            'reviewed_score' => 'Reviewed Score',
            'review_comments' => 'Comments',`
    }
];

const template = (req) => `<?php

declare(strict_types=1);

namespace App\\Modules\\Results\\Requests;

use Illuminate\\Foundation\\Http\\FormRequest;
use App\\Modules\\Results\\DTOs\\${req.dto};

class ${req.name} extends FormRequest
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
        return [${req.rules}
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [${req.messages}
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [${req.attributes}
        ];
    }

    /**
     * Transform the validated payload directly into an immutable DTO.
     */
    public function toDto(): ${req.dto}
    {
        // Controllers must consume this DTO, avoiding arrays and validated() returns.
        $data = $this->validated();
        
        // Ensure route parameters (if mapped to request) are merged if needed,
        // or just rely on the request merging route params internally before validation.
        return ${req.dto}::fromArray($data);
    }
}
`;

requests.forEach(req => {
    writePhpFile(path.join(baseDir, `${req.name}.php`), template(req));
});

console.log('Sprint 04 Phase 7 Requests generated successfully.');
