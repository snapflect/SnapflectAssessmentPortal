<?php
declare(strict_types=1);
namespace App\Modules\Governance\Requests;
use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Governance\DTOs\CreateDepartmentDto;
class CreateDepartmentRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array { return [ 'organization_id' => ['required', 'integer'], 'business_unit_id' => ['required', 'integer'], 'department_code' => ['required', 'string', 'max:50'], 'department_name' => ['required', 'string', 'max:255'] ]; }
    public function messages(): array { return [ 'organization_id.required' => 'The organization ID is mandatory.' ]; }
    public function attributes(): array { return [ 'organization_id' => 'organization' ]; }
    public function toDto(): CreateDepartmentDto { return CreateDepartmentDto::fromArray($this->validated()); }
}