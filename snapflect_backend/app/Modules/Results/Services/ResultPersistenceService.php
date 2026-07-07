<?php

declare(strict_types=1);

namespace App\Modules\Results\Services;

use App\Modules\Results\DTOs\CompetencyScoreDto;
use App\Modules\Results\DTOs\EvaluationResultDto;
use App\Modules\Results\DTOs\QuestionScoreDto;
use App\Modules\Results\DTOs\SectionScoreDto;
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
     * @param SectionScoreDto[] $sectionScores
     * @param CompetencyScoreDto[] $competencyScores
     * @param array $auditPayload
     * @return ScoringPersistenceResultDto
     */
    public function persistScoringTransaction(
        object $attempt,
        EvaluationResultDto $evaluation,
        array $questionScores,
        array $sectionScores,
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
        
        $qUuids = array_map(fn($qs) => $qs->questionUuid, $questionScores);
        $aqMap = DB::table('attempt_questions')
            ->where('assessment_attempt_id', $attempt->id)
            ->whereIn('snapshot_question_uuid', $qUuids)
            ->pluck('id', 'snapshot_question_uuid');
            
        $qMap = DB::table('questions')
            ->whereIn('uuid', $qUuids)
            ->pluck('id', 'uuid');

        foreach ($questionScores as $qs) {
            $qsInserts[] = [
                'uuid' => (string) Str::uuid(),
                'organization_id' => $attempt->organization_id,
                'assessment_result_id' => $resultId,
                'question_id' => $qMap[$qs->questionUuid] ?? null,
                'attempt_question_id' => $aqMap[$qs->questionUuid] ?? null,
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
            
            // Create manual score reviews for subjective questions during initial auto-scoring
            if ($version === 1) {
                $qsUuids = array_column($qsInserts, 'uuid');
                $insertedQs = DB::table('question_scores')->whereIn('uuid', $qsUuids)->get();
                $manualReviews = [];
                
                foreach ($insertedQs as $iqs) {
                    // Find corresponding DTO to check strategy
                    $dto = null;
                    foreach ($questionScores as $qsDto) {
                        $qId = $qMap[$qsDto->questionUuid] ?? null;
                        if ($qId === $iqs->question_id) {
                            $dto = $qsDto;
                            break;
                        }
                    }
                    
                    if ($dto && $dto->strategyApplied === \App\Modules\Results\Strategies\ScoringStrategyResolver::STRATEGY_MANUAL_REVIEW) {
                        $manualReviews[] = [
                            'uuid' => (string) Str::uuid(),
                            'organization_id' => $attempt->organization_id,
                            'assessment_result_id' => $resultId,
                            'question_score_id' => $iqs->id,
                            'reviewed_by' => null,
                            'review_status' => 'PENDING',
                            'original_score' => $iqs->max_score,
                            'reviewed_score' => 0.00,
                            'review_comments' => null,
                            'status' => 'ACTIVE',
                            'created_by' => $attempt->candidate_user_id,
                            'created_date' => $now,
                            'is_deleted' => 0,
                        ];
                    }
                }
                
                if (!empty($manualReviews)) {
                    DB::table('manual_score_reviews')->insert($manualReviews);
                }
            }
        }

        // 3.5 Insert Section Scores
        $secInserts = [];
        
        $secUuids = array_map(fn($ss) => $ss->sectionUuid, $sectionScores);
        $secMap = DB::table('blueprint_sections')
            ->whereIn('uuid', $secUuids)
            ->pluck('id', 'uuid');

        foreach ($sectionScores as $ss) {
            $secInserts[] = [
                'uuid' => (string) Str::uuid(),
                'organization_id' => $attempt->organization_id,
                'assessment_result_id' => $resultId,
                'assessment_section_id' => $secMap[$ss->sectionUuid] ?? null,
                'section_score' => $ss->awardedScore,
                'section_percentage' => $ss->percentage,
                'section_weight' => $ss->weight,
                'status' => 'SCORED',
                'created_date' => $now,
            ];
        }

        if (!empty($secInserts)) {
            DB::table('section_scores')->insert($secInserts);
        }

        // 4. Insert Competency Scores
        $compInserts = [];
        
        $cUuids = array_map(fn($cs) => $cs->competencyUuid, $competencyScores);
        $cMap = DB::table('competencies')
            ->whereIn('uuid', $cUuids)
            ->pluck('id', 'uuid');

        foreach ($competencyScores as $cs) {
            $compInserts[] = [
                'uuid' => (string) \Illuminate\Support\Str::uuid(),
                'organization_id' => $attempt->organization_id,
                'assessment_result_id' => $resultId,
                'competency_id' => $cMap[$cs->competencyUuid] ?? null,
                'competency_score' => $cs->awardedScore,
                'threshold_score' => $cs->maxScore,
                'competency_percentage' => $cs->percentage,
                'competency_status' => $cs->passed ? 'PASS' : 'FAIL',
                'created_date' => now()
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
