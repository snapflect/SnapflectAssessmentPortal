<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignQuestionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question_uuids' => ['required', 'array'],
            'question_uuids.*' => ['required', 'uuid', 'exists:questions,uuid'],
        ];
    }
}
