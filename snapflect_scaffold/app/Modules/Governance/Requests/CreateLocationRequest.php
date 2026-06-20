<?php
declare(strict_types=1);
namespace App\Modules\Governance\Requests;
use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Governance\DTOs\CreateLocationDto;
class CreateLocationRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array { return [ 'organization_id' => ['required', 'integer'], 'location_code' => ['required', 'string', 'max:50'], 'location_name' => ['required', 'string', 'max:255'], 'address' => ['nullable', 'string'], 'city' => ['nullable', 'string', 'max:100'], 'state' => ['nullable', 'string', 'max:100'], 'country' => ['nullable', 'string', 'max:100'] ]; }
    public function messages(): array { return [ 'organization_id.required' => 'The organization ID is mandatory.' ]; }
    public function attributes(): array { return [ 'organization_id' => 'organization' ]; }
    public function toDto(): CreateLocationDto { return CreateLocationDto::fromArray($this->validated()); }
}