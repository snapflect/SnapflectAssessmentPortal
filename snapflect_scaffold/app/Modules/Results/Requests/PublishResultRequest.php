<?php

declare(strict_types=1);

namespace App\Modules\Results\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Results\DTOs\PublishResultDto;

class PublishResultRequest extends FormRequest
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
            'publication_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'result_uuid.required' => 'A valid Result reference is required for publication.',
            'result_uuid.uuid' => 'The Result identifier must be a valid UUID.',
            'publication_notes.max' => 'Publication notes cannot exceed 1000 characters.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'result_uuid' => 'Result',
            'publication_notes' => 'Notes',
        ];
    }

    /**
     * Transform the validated payload directly into an immutable DTO.
     */
    public function toDto(): PublishResultDto
    {
        // Controllers must consume this DTO, avoiding arrays and validated() returns.
        $data = $this->validated();
        
        // Ensure route parameters (if mapped to request) are merged if needed,
        // or just rely on the request merging route params internally before validation.
        return PublishResultDto::fromArray($data);
    }
}
