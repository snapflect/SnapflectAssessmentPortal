<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Modules\Security\Models\Role;

class RoleFactory extends Factory
{
    protected $model = Role::class;

    public function definition(): array
    {
        return [
            'role_name' => fake()->jobTitle(),
            'role_code' => fake()->unique()->regexify('[A-Z_]{10}'),
            'is_system_role' => false,
            'status' => 'ACTIVE',
        ];
    }
}
