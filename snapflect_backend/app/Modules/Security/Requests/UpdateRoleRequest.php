<?php
declare(strict_types=1);
namespace App\Modules\Security\Requests;
use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Security\DTOs\UpdateRoleDto;
class UpdateRoleRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array { return [ 'role_name' => ['sometimes', 'required', 'string', 'max:255'], 'description' => ['nullable', 'string'], 'status' => ['nullable', 'string', 'max:20'] ]; }
    public function messages(): array { return [ 'role_name.required' => 'The role name cannot be empty.' ]; }
    public function attributes(): array { return [ 'role_name' => 'role name' ]; }
    public function toDto(): UpdateRoleDto { return UpdateRoleDto::fromArray($this->validated()); }
}