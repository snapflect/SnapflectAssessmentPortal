<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Models\AssessmentCategory;
use App\Modules\Assessment\Models\AssessmentType;

class AssessmentFactory extends Factory
{
    protected $model = Assessment::class;

    public function definition(): array
    {
        $organization = \App\Modules\Governance\Models\Organization::factory()->create();

        return [
            'organization_id'            => $organization->id,
            'assessment_category_id'     => AssessmentCategory::factory()->create(['organization_id' => $organization->id])->id,
            'assessment_type_id'         => AssessmentType::factory()->create(['organization_id' => $organization->id])->id,
            'assessment_code'            => fake()->unique()->regexify('[A-Z]{3}-[0-9]{4}'),
            'assessment_name'            => fake()->words(4, true),
            'description'                => fake()->sentence(),
            'estimated_duration_minutes' => fake()->numberBetween(30, 120),
            'total_marks'                => fake()->numberBetween(50, 200),
            'pass_percentage'            => 60.00,
            'is_randomized'              => false,
            'is_published'               => false,
            'current_state'              => 'DRAFT',
            'status'                     => 'active',
            'created_by'                 => null,
        ];
    }
}
