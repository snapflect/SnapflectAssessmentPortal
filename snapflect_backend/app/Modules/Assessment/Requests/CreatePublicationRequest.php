<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePublicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assessment_uuid' => 'required|uuid',
            'publication_code' => 'required|string|max:50|unique:assessment_publications,publication_code',
            'title' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'max_attempts' => 'required|integer|min:1',
            'is_proctored' => 'boolean',
        ];
    }
}
