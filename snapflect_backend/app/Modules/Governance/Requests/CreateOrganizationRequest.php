<?php
declare(strict_types=1);
namespace App\Modules\Governance\Requests;
use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Governance\DTOs\CreateOrganizationDto;
class CreateOrganizationRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array { return [ 'organization_code' => ['required', 'string', 'max:50'], 'organization_name' => ['required', 'string', 'max:255'], 'contact_email' => ['nullable', 'email'], 'plan_code' => ['nullable', 'string', 'exists:subscription_plans,plan_code'], 'payment_reference' => ['nullable', 'string'] ]; }
    public function messages(): array { return [ 'organization_code.required' => 'The organization code is mandatory.', 'organization_name.required' => 'The organization name is mandatory.' ]; }
    public function attributes(): array { return [ 'organization_code' => 'organization code', 'organization_name' => 'organization name' ]; }
    public function toDto(): CreateOrganizationDto { return CreateOrganizationDto::fromArray($this->validated()); }
}