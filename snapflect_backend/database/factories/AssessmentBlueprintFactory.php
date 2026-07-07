<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Modules\Assessment\Models\AssessmentBlueprint;

class AssessmentBlueprintFactory extends Factory
{
    protected $model = AssessmentBlueprint::class;

    public function definition(): array
    {
        return [
            'organization_id' => \App\Modules\Governance\Models\Organization::factory(),
            'assessment_id' => \App\Modules\Assessment\Models\Assessment::factory(),
            'blueprint_name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'status' => 'ACTIVE',
        ];
    }
}
