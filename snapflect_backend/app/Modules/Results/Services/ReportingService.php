<?php

declare(strict_types=1);

namespace App\Modules\Results\Services;

use App\Modules\Results\DTOs\ResultFilterDto;
use App\Modules\Results\DTOs\ReportingFilterDto;
use Illuminate\Database\Eloquent\Collection;

/**
 * READ ONLY SERVICE
 * No transactions. No writes.
 */
class ReportingService
{
    public function assessmentReport(ResultFilterDto $filter, int $organizationId, int $userId): Collection
    {
        return new Collection([
            [
                'assessment_name' => 'Angular Developer Assessment',
                'total_attempts' => 150,
                'completed' => 120,
                'pass_rate' => 75.5,
                'average_score' => 82.3,
            ],
            [
                'assessment_name' => 'Java Programming Basics',
                'total_attempts' => 85,
                'completed' => 80,
                'pass_rate' => 90.0,
                'average_score' => 88.1,
            ],
            [
                'assessment_name' => 'React Frontend Interview',
                'total_attempts' => 200,
                'completed' => 180,
                'pass_rate' => 60.5,
                'average_score' => 65.4,
            ]
        ]);
    }

    public function competencyReport(ResultFilterDto $filter, int $organizationId, int $userId): Collection
    {
        return new Collection([
            [
                'competency_name' => 'Frontend Architecture',
                'average_score' => 78.5,
                'candidates_evaluated' => 120,
                'proficient_count' => 90,
            ],
            [
                'competency_name' => 'State Management',
                'average_score' => 65.2,
                'candidates_evaluated' => 150,
                'proficient_count' => 60,
            ],
            [
                'competency_name' => 'UI/UX Implementation',
                'average_score' => 88.9,
                'candidates_evaluated' => 200,
                'proficient_count' => 180,
            ]
        ]);
    }

    public function passFailReport(ResultFilterDto $filter, int $organizationId, int $userId): Collection
    {
        return new Collection([
            [
                'assessment_name' => 'Angular Developer Assessment',
                'passed' => 90,
                'failed' => 30,
                'pass_percentage' => 75.0,
            ],
            [
                'assessment_name' => 'Java Programming Basics',
                'passed' => 72,
                'failed' => 8,
                'pass_percentage' => 90.0,
            ],
             [
                'assessment_name' => 'React Frontend Interview',
                'passed' => 108,
                'failed' => 72,
                'pass_percentage' => 60.0,
            ]
        ]);
    }

    public function candidateReport(ResultFilterDto $filter, int $organizationId, int $userId): Collection
    {
        return new Collection([
            [
                'candidate_name' => 'John Doe',
                'email' => 'john.doe@example.com',
                'assessments_taken' => 3,
                'average_score' => 85.5,
                'passed_count' => 3,
            ],
            [
                'candidate_name' => 'Jane Smith',
                'email' => 'jane.smith@example.com',
                'assessments_taken' => 2,
                'average_score' => 60.0,
                'passed_count' => 1,
            ],
            [
                'candidate_name' => 'Alice Johnson',
                'email' => 'alice.j@example.com',
                'assessments_taken' => 5,
                'average_score' => 92.0,
                'passed_count' => 5,
            ]
        ]);
    }
}
