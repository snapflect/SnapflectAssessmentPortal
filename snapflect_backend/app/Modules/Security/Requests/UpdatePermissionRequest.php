<?php
declare(strict_types=1);
namespace App\Modules\Security\Requests;
use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Security\DTOs\UpdatePermissionDto;
class UpdatePermissionRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array { return [ 'module' => ['sometimes', 'required', 'string', 'max:100'], 'description' => ['nullable', 'string'], 'status' => ['nullable', 'string', 'max:20'] ]; }
    public function messages(): array { return [ 'module.required' => 'The module cannot be empty.' ]; }
    public function attributes(): array { return [ 'module' => 'module' ]; }
    public function toDto(): UpdatePermissionDto { return UpdatePermissionDto::fromArray($this->validated()); }
}