<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Modules\Assessment\Models\AssessmentCategory;
use App\Modules\Assessment\Models\AssessmentType;
use Illuminate\Support\Str;

class AssessmentDataSeeder extends Seeder
{
    public function run(): void
    {
        $organizationId = 1; // Default mock organization
        $userId = 1; // Default mock user

        AssessmentCategory::firstOrCreate(
            ['category_code' => 'TECH'],
            [
                'uuid' => Str::uuid(),
                'organization_id' => $organizationId,
                'category_name' => 'Technical Skills',
                'description' => 'Assessments related to technical abilities',
                'status' => 'ACTIVE',
                'created_by' => $userId,
                'created_date' => now(),
                'modified_date' => now(),
            ]
        );

        AssessmentCategory::firstOrCreate(
            ['category_code' => 'SOFT'],
            [
                'uuid' => Str::uuid(),
                'organization_id' => $organizationId,
                'category_name' => 'Soft Skills',
                'description' => 'Assessments related to communication and leadership',
                'status' => 'ACTIVE',
                'created_by' => $userId,
                'created_date' => now(),
                'modified_date' => now(),
            ]
        );

        AssessmentType::firstOrCreate(
            ['type_code' => 'MCQ'],
            [
                'uuid' => Str::uuid(),
                'organization_id' => $organizationId,
                'type_name' => 'Multiple Choice',
                'description' => 'Multiple choice questions',
                'status' => 'ACTIVE',
                'created_by' => $userId,
                'created_date' => now(),
                'modified_date' => now(),
            ]
        );

        AssessmentType::firstOrCreate(
            ['type_code' => 'CODING'],
            [
                'uuid' => Str::uuid(),
                'organization_id' => $organizationId,
                'type_name' => 'Coding Challenge',
                'description' => 'Practical coding challenge',
                'status' => 'ACTIVE',
                'created_by' => $userId,
                'created_date' => now(),
                'modified_date' => now(),
            ]
        );
    }
}
