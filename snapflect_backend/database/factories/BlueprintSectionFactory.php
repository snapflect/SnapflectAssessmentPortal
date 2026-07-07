<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Modules\Assessment\Models\BlueprintSection;

class BlueprintSectionFactory extends Factory
{
    protected $model = BlueprintSection::class;

    public function definition(): array
    {
        return [
            'organization_id' => \App\Modules\Governance\Models\Organization::factory(),
            'blueprint_id' => \App\Modules\Assessment\Models\AssessmentBlueprint::factory(),
            'section_name' => $this->faker->word(),
            'display_order' => $this->faker->numberBetween(1, 10),
            'section_weight' => $this->faker->randomFloat(2, 0, 100),
            'selection_strategy' => 'MANUAL',
            'status' => 'ACTIVE',
        ];
    }
}
