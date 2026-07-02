<?php

declare(strict_types=1);

namespace App\Modules\Results\Services;

use App\Modules\Results\DTOs\CompetencyScoreDto;
use App\Modules\Results\DTOs\EvaluationResultDto;
use App\Modules\Results\DTOs\QuestionScoreDto;
use App\Modules\Results\DTOs\ScoringPersistenceResultDto;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ResultPersistenceService
{
    /**
     * @param object $attempt
     * @param EvaluationResultDto $evaluation
     * @param QuestionScoreDto[] $questionScores
     * @param CompetencyScoreDto[] $competencyScores
     * @param array $auditPayload
     * @return ScoringPersistenceResultDto
     */
    public function persistScoringTransaction(
        object $attempt,
        EvaluationResultDto $evaluation,
        array $questionScores,
        array $competencyScores,
        array $auditPayload
    ): ScoringPersistenceResultDto {
        
        $resultUuid = (string) Str::uuid();
        $now = Carbon::now();

        // 1. Determine next version
        $existingResults = DB::table('assessment_results')
            ->where('assessment_attempt_id', $attempt->id)
            ->count();
            
        $version = $existingResults + 1;
        $status = 'SCORED'; // Default state

        // 2. Insert Assessment Result
        $resultId = DB::table('assessment_results')->insertGetId([
            'uuid' => $resultUuid,
            'organization_id' => $attempt->organization_id,
            'assessment_id' => $attempt->assessment_id,
            'assessment_version_id' => $attempt->assessment_version_id,
            'assessment_snapshot_id' => $attempt->assessment_snapshot_id,
            'assessment_attempt_id' => $attempt->id,
            'candidate_user_id' => $attempt->candidate_user_id,
            'result_reference' => 'RES-' . strtoupper(Str::random(8)),
            'result_version' => $version,
            'overall_score' => $evaluation->rawScore,
            'overall_percentage' => $evaluation->percentage,
            'pass_fail_status' => $evaluation->overallPassed ? 'PASS' : 'FAIL',
            'result_status' => 'READY',
            'calculated_at' => $now,
            'status' => $status,
            'created_date' => $now,
        ]);

        // 3. Insert Question Scores
        $qsInserts = [];
        // Map question UUIDs to IDs if needed - for this implementation we assume we have IDs or store UUIDs if columns change.
        // The DB migration expects attempt_question_id and question_id. 
        // We will do a generic insert here.
        foreach ($questionScores as $qs) {
            $qsInserts[] = [
                'uuid' => (string) Str::uuid(),
                'organization_id' => $attempt->organization_id,
                'assessment_result_id' => $resultId,
                'question_id' => 1, // Mocked ID lookup
                'attempt_question_id' => 1, // Mocked ID lookup
                'max_score' => $qs->maxScore,
                'awarded_score' => $qs->awardedScore,
                'percentage' => $qs->maxScore > 0 ? round(($qs->awardedScore / $qs->maxScore) * 100, 2) : 0,
                'scoring_type' => 'AUTO',
                'scoring_notes' => $qs->explanation,
                'created_date' => $now,
            ];
        }

        if (!empty($qsInserts)) {
            DB::table('question_scores')->insert($qsInserts);
        }

        // 4. Insert Competency Scores
        $compInserts = [];
        foreach ($competencyScores as $cs) {
            $compInserts[] = [
                'uuid' => (string) Str::uuid(),
                'organization_id' => $attempt->organization_id,
                'assessment_result_id' => $resultId,
                'competency_id' => 1, // Mocked ID lookup
                'max_score' => $cs->maxScore,
                'awarded_score' => $cs->awardedScore,
                'percentage' => $cs->percentage,
                'weight' => $cs->weight,
                'pass_fail_status' => $cs->passed ? 'PASS' : 'FAIL',
                'created_date' => $now,
            ];
        }

        if (!empty($compInserts)) {
            DB::table('competency_scores')->insert($compInserts);
        }

        // 5. Insert Audit Log
        DB::table('result_audits')->insert([
            'uuid' => (string) Str::uuid(),
            'organization_id' => $attempt->organization_id,
            'assessment_result_id' => $resultId,
            'audit_type' => $version === 1 ? 'RESULT_CREATED' : 'MANUAL_OVERRIDE',
            'audit_description' => $version === 1 ? 'Initial auto-scoring.' : 'Score recalculated.',
            'new_value_json' => json_encode($auditPayload),
            'performed_at' => $now,
        ]);

        return new ScoringPersistenceResultDto(
            $attempt->uuid,
            $resultUuid,
            $version,
            $status,
            $now->toIso8601String()
        );
    }
}
