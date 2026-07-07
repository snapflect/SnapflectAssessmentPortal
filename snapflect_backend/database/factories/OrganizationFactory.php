<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Modules\Governance\Models\Organization;

class OrganizationFactory extends Factory
{
    protected $model = Organization::class;

    public function definition(): array
    {
        return [
            'organization_name' => fake()->company(),
            'organization_code' => fake()->unique()->regexify('[A-Z0-9]{5}'),
            'status' => 'ACTIVE',
        ];
    }
}
