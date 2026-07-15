<?php
declare(strict_types=1);
namespace App\Modules\Security\Requests;
use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Security\DTOs\CreateRoleDto;
class CreateRoleRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array { return [ 'organization_id' => ['nullable', 'integer'], 'role_code' => ['nullable', 'string', 'max:50', \Illuminate\Validation\Rule::unique('roles')->whereNull('deleted_date')], 'role_name' => ['required', 'string', 'max:255'], 'description' => ['nullable', 'string'] ]; }
    public function messages(): array { return [ 'role_code.required' => 'The role code is mandatory.' ]; }
    public function attributes(): array { return [ 'role_code' => 'role code' ]; }
    public function toDto(): CreateRoleDto { return CreateRoleDto::fromArray($this->validated()); }
}