<?php
declare(strict_types=1);
namespace App\Modules\Governance\Requests;
use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Governance\DTOs\UpdateBusinessUnitDto;
class UpdateBusinessUnitRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array { return [ 'business_unit_name' => ['sometimes', 'required', 'string', 'max:255'], 'status' => ['nullable', 'string', 'max:20'] ]; }
    public function messages(): array { return [ 'business_unit_name.required' => 'The business unit name cannot be empty.' ]; }
    public function attributes(): array { return [ 'business_unit_name' => 'business unit name' ]; }
    public function toDto(): UpdateBusinessUnitDto { return UpdateBusinessUnitDto::fromArray($this->validated()); }
}