<?php

declare(strict_types=1);

namespace App\Modules\Results\Services;

use App\Modules\Results\DTOs\ScoringPersistenceResultDto;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use stdClass;

class ScoringOrchestratorService
{
    public function __construct(
        private AutoScoringService $autoScoringService,
        private SectionScoringService $sectionScoringService,
        private CompetencyScoringService $competencyScoringService,
        private EvaluationService $evaluationService,
        private AuditGenerationService $auditService,
        private ResultPersistenceService $persistenceService
    ) {
    }

    /**
     * @param string $attemptUuid
     * @return ScoringPersistenceResultDto
     * @throws InvalidArgumentException
     */
    public function executeScoringPipeline(string $attemptUuid, bool $forceRecalculate = false): ScoringPersistenceResultDto
    {
        return DB::transaction(function () use ($attemptUuid, $forceRecalculate) {
            
            // 1. Fetch Attempt with Pessimistic Lock
            $attempt = DB::table('assessment_attempts')
                ->where('uuid', $attemptUuid)
                ->lockForUpdate()
                ->first();

            if (!$attempt) {
                throw new InvalidArgumentException("Attempt not found");
            }

            if (!$forceRecalculate && $attempt->status !== 'SUBMITTED' && $attempt->status !== 'ERROR') {
                throw new InvalidArgumentException("Attempt is not ready for scoring. Current status: {$attempt->status}");
            }

            // 2. Transition State to prevent race conditions
            DB::table('assessment_attempts')
                ->where('id', $attempt->id)
                ->update(['status' => 'EVALUATING']);

            // 3. Load Dependencies
            $snapshotJson = DB::table('assessment_snapshots')
                ->where('id', $attempt->assessment_snapshot_id)
                ->value('snapshot_json');
            $blueprint = json_decode($snapshotJson, true) ?? [];

            $candidateAnswersRaw = DB::table('candidate_answers')
                ->join('attempt_questions', 'candidate_answers.attempt_question_id', '=', 'attempt_questions.id')
                ->where('candidate_answers.assessment_attempt_id', $attempt->id)
                ->select('candidate_answers.*', 'attempt_questions.snapshot_question_uuid')
                ->get();
            
            // Map answers for the AutoScoringService
            $candidateAnswers = [];
            foreach ($candidateAnswersRaw as $ans) {
                $qUuid = $ans->snapshot_question_uuid; 
                $candidateAnswers[$qUuid] = [
                    'payload' => $ans->selected_option_uuids_json ? json_decode($ans->selected_option_uuids_json, true) : ($ans->selected_option_uuid ?? $ans->text_answer ?? $ans->numeric_answer),
                ];
            }

            // 4. Mathematical Pipeline
            $questionScores = $this->autoScoringService->evaluateAttempt($blueprint, $candidateAnswers);
            
            // 4.1 Apply Manual Score Overrides
            $manualReviews = DB::table('manual_score_reviews')
                ->join('assessment_results', 'manual_score_reviews.assessment_result_id', '=', 'assessment_results.id')
                ->join('question_scores', 'manual_score_reviews.question_score_id', '=', 'question_scores.id')
                ->join('attempt_questions', 'question_scores.attempt_question_id', '=', 'attempt_questions.id')
                ->where('assessment_results.assessment_attempt_id', $attempt->id)
                ->where('manual_score_reviews.review_status', 'COMPLETED')
                ->select('attempt_questions.snapshot_question_uuid', 'manual_score_reviews.reviewed_score', 'manual_score_reviews.review_comments')
                ->get()
                ->keyBy('snapshot_question_uuid')
                ->toArray();

            foreach ($questionScores as $index => $qs) {
                if (isset($manualReviews[$qs->questionUuid])) {
                    $review = $manualReviews[$qs->questionUuid];
                    $awardedScore = (float) $review->reviewed_score;
                    $isCorrect = $awardedScore > 0;
                    $explanation = 'Manual Override: ' . ($review->review_comments ?? 'Score updated by reviewer.');
                    
                    $questionScores[$index] = new \App\Modules\Results\DTOs\QuestionScoreDto(
                        $qs->questionUuid,
                        $qs->maxScore,
                        $awardedScore,
                        $qs->penaltyApplied,
                        $isCorrect,
                        $qs->strategyApplied,
                        $explanation,
                        $qs->candidateAnswer,
                        $qs->correctAnswer
                    );
                }
            }

            $sectionScores = $this->sectionScoringService->evaluateSections($blueprint, $questionScores);
            $competencyScores = $this->competencyScoringService->evaluateCompetencies($blueprint, $questionScores);
            $evaluation = $this->evaluationService->evaluateAttempt($blueprint, $questionScores, $competencyScores);

            // 5. Generate Audit Payload
            $auditPayload = $this->auditService->generateAuditPayload($questionScores, $evaluation);

            // 6. Persistence
            $resultDto = $this->persistenceService->persistScoringTransaction(
                $attempt,
                $evaluation,
                $questionScores,
                $sectionScores,
                $competencyScores,
                $auditPayload
            );

            // 7. Finalize State
            DB::table('assessment_attempts')
                ->where('id', $attempt->id)
                ->update(['status' => 'SCORED']);

            return $resultDto;
        });
    }
}
