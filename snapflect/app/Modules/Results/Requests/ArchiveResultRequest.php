<?php

declare(strict_types=1);

namespace App\Modules\Results\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Results\DTOs\ArchiveResultDto;

class ArchiveResultRequest extends FormRequest
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
            'archive_reason' => ['required', 'string', 'max:1000'],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'result_uuid.required' => 'A valid Result reference is required for archiving.',
            'result_uuid.uuid' => 'The Result identifier must be a valid UUID.',
            'archive_reason.required' => 'You must provide a strict reason to archive a published result.',
            'archive_reason.max' => 'The archive reason cannot exceed 1000 characters.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'result_uuid' => 'Result',
            'archive_reason' => 'Reason',
        ];
    }

    /**
     * Transform the validated payload directly into an immutable DTO.
     */
    public function toDto(): ArchiveResultDto
    {
        // Controllers must consume this DTO, avoiding arrays and validated() returns.
        $data = $this->validated();
        
        // Ensure route parameters (if mapped to request) are merged if needed,
        // or just rely on the request merging route params internally before validation.
        return ArchiveResultDto::fromArray($data);
    }
}
