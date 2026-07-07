<?php

declare(strict_types=1);

namespace App\Modules\Results\Services;

use App\Modules\Results\DTOs\CalculateResultDto;
use App\Modules\Results\DTOs\RecalculateResultDto;
use App\Modules\Results\Models\AssessmentResult;
use App\Modules\Results\Models\ResultVersion;
use App\Modules\Results\Models\ResultSnapshot;
use App\Modules\Results\Models\ResultAudit;
use App\Modules\Results\Exceptions\ResultStateException;
use Illuminate\Support\Facades\DB;

class ResultService
{
    public function __construct(
        private ScoringOrchestratorService $scoringOrchestrator
    ) {}

    public function calculate(CalculateResultDto $dto, int $organizationId, int $userId): AssessmentResult
    {
        // For admin manual recalculation, we can just force the scoring pipeline
        $persistenceDto = $this->scoringOrchestrator->executeScoringPipeline($dto->attempt_uuid, true);
        return AssessmentResult::where('uuid', $persistenceDto->resultUuid)->firstOrFail();
    }

    public function recalculate(RecalculateResultDto $dto, int $organizationId, int $userId): AssessmentResult
    {
        $result = AssessmentResult::where('uuid', $dto->result_uuid)->firstOrFail();
        $attempt = \App\Modules\Delivery\Models\AssessmentAttempt::findOrFail($result->assessment_attempt_id);

        // For manual recalculation
        $persistenceDto = $this->scoringOrchestrator->executeScoringPipeline($attempt->uuid, true);
        
        $recalculatedResult = AssessmentResult::where('uuid', $persistenceDto->resultUuid)->firstOrFail();
        
        // Log manual recalculation reason if needed (Audit is mostly handled by orchestrator)
        $this->createAudit($recalculatedResult->id, 'RESULT_UPDATED', $dto->recalculation_reason, $organizationId, $userId);
        
        return $recalculatedResult;
    }

    public function createVersion(AssessmentResult $result, string $reason, int $organizationId, int $userId): ResultVersion
    {
        return DB::transaction(function () use ($result, $reason, $organizationId, $userId) {
            $version = new ResultVersion();
            $version->uuid = \Illuminate\Support\Str::uuid()->toString();
            $version->organization_id = $organizationId;
            $version->assessment_result_id = $result->id;
            $version->version_number = $result->result_version + 1;
            $version->version_label = 'v' . ($result->result_version + 1);
            $version->version_reason = $reason;
            $version->created_by = $userId;
            $version->save();
            return $version;
        });
    }

    public function createSnapshot(AssessmentResult $result, ResultVersion $version, int $organizationId, int $userId): ResultSnapshot
    {
        return DB::transaction(function () use ($result, $version, $organizationId) {
            $snapshotJson = json_encode($result->toArray());
            $rulesSnapshotJson = json_encode([]);
            
            $snapshot = new ResultSnapshot();
            $snapshot->uuid = \Illuminate\Support\Str::uuid()->toString();
            $snapshot->organization_id = $organizationId;
            $snapshot->assessment_result_id = $result->id;
            $snapshot->result_version_id = $version->id;
            $snapshot->snapshot_json = $snapshotJson;
            $snapshot->rules_snapshot_json = $rulesSnapshotJson;
            $snapshot->snapshot_hash = hash('sha256', $snapshotJson);
            $snapshot->calculated_at = \Carbon\Carbon::now();
            $snapshot->save();
            return $snapshot;
        });
    }

    public function createAudit(int $resultId, string $type, string $description, int $organizationId, int $userId): void
    {
        DB::table('result_audits')->insert([
            'uuid' => \Illuminate\Support\Str::uuid()->toString(),
            'organization_id' => $organizationId,
            'assessment_result_id' => $resultId,
            'audit_type' => $type,
            'audit_description' => $description,
            'new_value_json' => '{}',
            'performed_by' => $userId,
            'performed_at' => \Carbon\Carbon::now(),
        ]);
    }
}
