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
                ->where('assessment_attempt_id', $attempt->id)
                ->get();
            
            // Map answers for the AutoScoringService
            $candidateAnswers = [];
            foreach ($candidateAnswersRaw as $ans) {
                // Determine question uuid. (Mocked mapping lookup if needed).
                $qUuid = 'q-mock-uuid'; 
                $candidateAnswers[$qUuid] = [
                    'payload' => json_decode($ans->selected_option_uuids_json ?? '[]', true),
                ];
            }

            // 4. Mathematical Pipeline
            $questionScores = $this->autoScoringService->evaluateAttempt($blueprint, $candidateAnswers);
            $competencyScores = $this->competencyScoringService->evaluateCompetencies($blueprint, $questionScores);
            $evaluation = $this->evaluationService->evaluateAttempt($blueprint, $questionScores, $competencyScores);

            // 5. Generate Audit Payload
            $auditPayload = $this->auditService->generateAuditPayload($questionScores, $evaluation);

            // 6. Persistence
            $resultDto = $this->persistenceService->persistScoringTransaction(
                $attempt,
                $evaluation,
                $questionScores,
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
