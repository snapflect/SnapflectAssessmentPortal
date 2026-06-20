<?php
declare(strict_types=1);
namespace App\Modules\Security\Requests;
use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Security\DTOs\CreatePermissionDto;
class CreatePermissionRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array { return [ 'permission_code' => ['required', 'string', 'max:100'], 'module' => ['required', 'string', 'max:100'], 'description' => ['nullable', 'string'] ]; }
    public function messages(): array { return [ 'permission_code.required' => 'The permission code is mandatory.' ]; }
    public function attributes(): array { return [ 'permission_code' => 'permission code' ]; }
    public function toDto(): CreatePermissionDto { return CreatePermissionDto::fromArray($this->validated()); }
}