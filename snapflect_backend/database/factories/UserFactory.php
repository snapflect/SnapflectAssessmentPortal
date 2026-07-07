<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Modules\Security\Models\User;

class UserFactory extends Factory
{
    protected $model = User::class;
    
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'organization_id' => \App\Modules\Governance\Models\Organization::factory(),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'status' => 'ACTIVE',
        ];
    }
}
