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
        $query = \App\Modules\Results\Models\AssessmentResult::query()
            ->where('assessment_results.organization_id', $organizationId)
            ->join('assessments', 'assessment_results.assessment_id', '=', 'assessments.id')
            ->select(
                'assessments.assessment_name as assessment_name',
                \Illuminate\Support\Facades\DB::raw('COUNT(assessment_results.id) as total_attempts'),
                \Illuminate\Support\Facades\DB::raw('SUM(CASE WHEN assessment_results.result_status = \'COMPLETED\' THEN 1 ELSE 0 END) as completed'),
                \Illuminate\Support\Facades\DB::raw('ROUND(AVG(assessment_results.overall_percentage), 2) as average_score'),
                \Illuminate\Support\Facades\DB::raw('ROUND(SUM(CASE WHEN assessment_results.pass_fail_status = \'PASS\' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(assessment_results.id), 0), 2) as pass_rate')
            )
            ->groupBy('assessments.id', 'assessments.assessment_name');

        if ($filter->assessment_uuid) {
            $query->where('assessments.uuid', $filter->assessment_uuid);
        }

        return $query->get();
    }

    public function competencyReport(ResultFilterDto $filter, int $organizationId, int $userId): Collection
    {
        $query = \App\Modules\Results\Models\CompetencyScore::query()
            ->where('competency_scores.organization_id', $organizationId)
            ->join('competencies', 'competency_scores.competency_id', '=', 'competencies.id')
            ->select(
                'competencies.competency_name as competency_name',
                \Illuminate\Support\Facades\DB::raw('ROUND(AVG(competency_scores.competency_percentage), 2) as average_score'),
                \Illuminate\Support\Facades\DB::raw('COUNT(competency_scores.id) as candidates_evaluated'),
                \Illuminate\Support\Facades\DB::raw('SUM(CASE WHEN competency_scores.competency_status = \'PASS\' OR competency_scores.competency_status = \'PROFICIENT\' OR competency_scores.competency_percentage >= competency_scores.threshold_score THEN 1 ELSE 0 END) as proficient_count')
            )
            ->groupBy('competencies.id', 'competencies.competency_name');

        return $query->get();
    }

    public function passFailReport(ResultFilterDto $filter, int $organizationId, int $userId): Collection
    {
        $query = \App\Modules\Results\Models\AssessmentResult::query()
            ->where('assessment_results.organization_id', $organizationId)
            ->join('assessments', 'assessment_results.assessment_id', '=', 'assessments.id')
            ->select(
                'assessments.assessment_name as assessment_name',
                \Illuminate\Support\Facades\DB::raw('SUM(CASE WHEN assessment_results.pass_fail_status = \'PASS\' THEN 1 ELSE 0 END) as passed'),
                \Illuminate\Support\Facades\DB::raw('SUM(CASE WHEN assessment_results.pass_fail_status = \'FAIL\' THEN 1 ELSE 0 END) as failed'),
                \Illuminate\Support\Facades\DB::raw('ROUND(SUM(CASE WHEN assessment_results.pass_fail_status = \'PASS\' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(assessment_results.id), 0), 2) as pass_percentage')
            )
            ->groupBy('assessments.id', 'assessments.assessment_name');

        if ($filter->assessment_uuid) {
            $query->where('assessments.uuid', $filter->assessment_uuid);
        }

        return $query->get();
    }

    public function candidateReport(ResultFilterDto $filter, int $organizationId, int $userId): Collection
    {
        $query = \App\Modules\Results\Models\AssessmentResult::query()
            ->where('assessment_results.organization_id', $organizationId)
            ->join('users', 'assessment_results.candidate_user_id', '=', 'users.id')
            ->select(
                \Illuminate\Support\Facades\DB::raw("CONCAT(users.first_name, ' ', users.last_name) as candidate_name"),
                'users.email',
                \Illuminate\Support\Facades\DB::raw('COUNT(assessment_results.id) as assessments_taken'),
                \Illuminate\Support\Facades\DB::raw('ROUND(AVG(assessment_results.overall_percentage), 2) as average_score'),
                \Illuminate\Support\Facades\DB::raw('SUM(CASE WHEN assessment_results.pass_fail_status = \'PASS\' THEN 1 ELSE 0 END) as passed_count')
            )
            ->groupBy('users.id', 'users.first_name', 'users.last_name', 'users.email');

        if ($filter->candidate_uuid) {
            $query->where('users.uuid', $filter->candidate_uuid);
        }

        return $query->get();
    }
}
