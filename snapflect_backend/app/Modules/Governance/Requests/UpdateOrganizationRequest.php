<?php
declare(strict_types=1);
namespace App\Modules\Governance\Requests;
use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Governance\DTOs\UpdateOrganizationDto;
class UpdateOrganizationRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array { return [ 
        'organization_name' => ['nullable', 'string', 'max:255'], 
        'contact_email' => ['nullable', 'email'], 
        'status' => ['nullable', 'string', 'in:ACTIVE,INACTIVE,SUSPENDED'],
        'plan_code' => ['nullable', 'string', 'exists:subscription_plans,plan_code'], 
        'payment_reference' => ['nullable', 'string'],
        'tenant_type' => ['nullable', 'string', 'in:enterprise,partner'],
        'phone_number' => ['nullable', 'string', 'max:50'],
        'it_escalation_email' => ['nullable', 'email', 'max:255'],
        'primary_color' => ['nullable', 'string', 'max:20'],
        'theme_mode' => ['nullable', 'string', 'in:system,light,dark'],
        'enforce_mfa' => ['nullable', 'boolean'],
        'enable_sso' => ['nullable', 'boolean'],
        'session_timeout' => ['nullable', 'string', 'max:20'],
        'logo_path' => ['nullable', 'string'],
        'users' => ['nullable', 'array'],
        'users.*.email' => ['required_with:users', 'email'],
        'users.*.role' => ['required_with:users', 'string']
    ]; }
    public function messages(): array { return [ 'organization_name.required' => 'The organization name cannot be empty.' ]; }
    public function attributes(): array { return [ 'organization_name' => 'organization name' ]; }
    public function toDto(): UpdateOrganizationDto { return UpdateOrganizationDto::fromArray($this->validated()); }
}