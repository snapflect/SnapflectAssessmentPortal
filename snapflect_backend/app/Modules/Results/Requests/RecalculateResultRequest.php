<?php

declare(strict_types=1);

namespace App\Modules\Results\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Results\DTOs\RecalculateResultDto;

class RecalculateResultRequest extends FormRequest
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
            'recalculation_reason' => ['required', 'string', 'max:1000'],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'result_uuid.required' => 'A valid Result reference is required for recalculation.',
            'result_uuid.uuid' => 'The Result identifier must be a valid UUID.',
            'recalculation_reason.required' => 'You must provide a strict reason to trigger a ledger recalculation.',
            'recalculation_reason.max' => 'The recalculation reason cannot exceed 1000 characters.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'result_uuid' => 'Result',
            'recalculation_reason' => 'Reason',
        ];
    }

    /**
     * Transform the validated payload directly into an immutable DTO.
     */
    public function toDto(): RecalculateResultDto
    {
        // Controllers must consume this DTO, avoiding arrays and validated() returns.
        $data = $this->validated();
        
        // Ensure route parameters (if mapped to request) are merged if needed,
        // or just rely on the request merging route params internally before validation.
        return RecalculateResultDto::fromArray($data);
    }
}
