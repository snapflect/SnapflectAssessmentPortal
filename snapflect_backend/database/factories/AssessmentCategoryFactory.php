<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Modules\Assessment\Models\AssessmentCategory;

class AssessmentCategoryFactory extends Factory
{
    protected $model = AssessmentCategory::class;

    public function definition(): array
    {
        return [
            'organization_id' => \App\Modules\Governance\Models\Organization::factory(),
            'category_code'   => fake()->unique()->regexify('[A-Z]{3}-[0-9]{3}'),
            'category_name'   => fake()->words(3, true),
            'description'     => fake()->sentence(),
            'status'          => 'ACTIVE',
        ];
    }
}
