<?php
declare(strict_types=1);
namespace App\Modules\Governance\Requests;
use Illuminate\Foundation\Http\FormRequest;
use App\Modules\Governance\DTOs\UpdateLocationDto;
class UpdateLocationRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array { return [ 'location_name' => ['sometimes', 'required', 'string', 'max:255'], 'address' => ['nullable', 'string'], 'city' => ['nullable', 'string', 'max:100'], 'state' => ['nullable', 'string', 'max:100'], 'country' => ['nullable', 'string', 'max:100'], 'status' => ['nullable', 'string', 'max:20'] ]; }
    public function messages(): array { return [ 'location_name.required' => 'The location name cannot be empty.' ]; }
    public function attributes(): array { return [ 'location_name' => 'location name' ]; }
    public function toDto(): UpdateLocationDto { return UpdateLocationDto::fromArray($this->validated()); }
}