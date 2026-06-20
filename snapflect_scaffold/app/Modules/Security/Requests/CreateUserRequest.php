<?php
declare(strict_types=1);
namespace App\Modules\Security\Requests;
use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Security\DTOs\CreateUserDto;
class CreateUserRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array { return [ 'organization_id' => ['required', 'integer'], 'business_unit_id' => ['nullable', 'integer'], 'department_id' => ['nullable', 'integer'], 'location_id' => ['nullable', 'integer'], 'first_name' => ['required', 'string', 'max:100'], 'last_name' => ['required', 'string', 'max:100'], 'email' => ['required', 'email', 'max:255'], 'password' => ['required', 'string', 'min:12'] ]; }
    public function messages(): array { return [ 'organization_id.required' => 'The organization ID is mandatory.' ]; }
    public function attributes(): array { return [ 'organization_id' => 'organization' ]; }
    public function toDto(): CreateUserDto { return CreateUserDto::fromArray($this->validated()); }
}