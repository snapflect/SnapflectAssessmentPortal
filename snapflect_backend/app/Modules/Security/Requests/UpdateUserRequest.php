<?php
declare(strict_types=1);
namespace App\Modules\Security\Requests;
use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Security\DTOs\UpdateUserDto;
class UpdateUserRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array { return [ 'business_unit_id' => ['nullable', 'integer'], 'department_id' => ['nullable', 'integer'], 'location_id' => ['nullable', 'integer'], 'first_name' => ['sometimes', 'required', 'string', 'max:100'], 'last_name' => ['sometimes', 'required', 'string', 'max:100'], 'email' => ['sometimes', 'required', 'email', 'max:255', \Illuminate\Validation\Rule::unique('users', 'email')->ignore($this->route('uuid'), 'uuid')], 'password' => ['nullable', 'string', 'min:12'], 'status' => ['nullable', 'string', 'max:20'] ]; }
    public function messages(): array { return [ 'first_name.required' => 'The first name cannot be empty.' ]; }
    public function attributes(): array { return [ 'first_name' => 'first name' ]; }
    public function toDto(): UpdateUserDto { return UpdateUserDto::fromArray($this->validated()); }
}