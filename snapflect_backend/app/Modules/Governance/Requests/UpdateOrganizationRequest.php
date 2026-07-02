<?php
declare(strict_types=1);
namespace App\Modules\Governance\Requests;
use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Governance\DTOs\UpdateOrganizationDto;
class UpdateOrganizationRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array { return [ 'organization_name' => ['sometimes', 'required', 'string', 'max:255'], 'contact_email' => ['nullable', 'email'], 'status' => ['nullable', 'string', 'max:20'] ]; }
    public function messages(): array { return [ 'organization_name.required' => 'The organization name cannot be empty.' ]; }
    public function attributes(): array { return [ 'organization_name' => 'organization name' ]; }
    public function toDto(): UpdateOrganizationDto { return UpdateOrganizationDto::fromArray($this->validated()); }
}