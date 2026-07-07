<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Modules\Assessment\Models\AssessmentType;

class AssessmentTypeFactory extends Factory
{
    protected $model = AssessmentType::class;

    public function definition(): array
    {
        return [
            'organization_id' => \App\Modules\Governance\Models\Organization::factory(),
            'type_code'       => fake()->unique()->regexify('[A-Z]{3}-[0-9]{3}'),
            'type_name'       => fake()->words(3, true),
            'description'     => fake()->sentence(),
            'status'          => 'ACTIVE',
        ];
    }
}
