<?php
declare(strict_types=1);
namespace App\Modules\Governance\Requests;
use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Governance\DTOs\UpdateDepartmentDto;
class UpdateDepartmentRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array { return [ 'business_unit_id' => ['sometimes', 'required', 'integer'], 'department_name' => ['sometimes', 'required', 'string', 'max:255'], 'status' => ['nullable', 'string', 'max:20'] ]; }
    public function messages(): array { return [ 'department_name.required' => 'The department name cannot be empty.' ]; }
    public function attributes(): array { return [ 'department_name' => 'department name' ]; }
    public function toDto(): UpdateDepartmentDto { return UpdateDepartmentDto::fromArray($this->validated()); }
}