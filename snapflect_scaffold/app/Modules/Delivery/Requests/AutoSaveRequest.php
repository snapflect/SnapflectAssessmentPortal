<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AutoSaveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'questionUuid' => 'required|uuid',
            'clientDraftVersion' => 'required|string',
            'answerPayload' => 'nullable' // Mixed type depending on question logic
        ];
    }
}
