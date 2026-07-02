<?php

declare(strict_types=1);

namespace App\Modules\Results\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Results\Services\ScoringOrchestratorService;
use App\Modules\Security\Context\TenantContextResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScoringController extends Controller
{
    public function __construct(
        private ScoringOrchestratorService $orchestrator,
        private TenantContextResolver $contextResolver
    ) {
    }

    public function triggerScoring(Request $request, string $attemptUuid): JsonResponse
    {
        $tenantId = $this->contextResolver->resolveOrganizationId($request);

        // Idempotency check
        $existingResult = DB::table('assessment_results')
            ->join('assessment_attempts', 'assessment_results.assessment_attempt_id', '=', 'assessment_attempts.id')
            ->where('assessment_attempts.uuid', $attemptUuid)
            ->where('assessment_attempts.organization_id', $tenantId)
            ->where('assessment_results.result_status', 'READY')
            ->orderByDesc('assessment_results.result_version')
            ->select('assessment_results.uuid as resultUuid', 'assessment_results.result_version as version', 'assessment_results.status')
            ->first();

        if ($existingResult) {
            return response()->json([
                'data' => [
                    'attemptUuid' => $attemptUuid,
                    'resultUuid' => $existingResult->resultUuid,
                    'version' => $existingResult->version,
                    'status' => $existingResult->status,
                    'message' => 'Scoring already completed.'
                ]
            ]);
        }

        try {
            $dto = $this->orchestrator->executeScoringPipeline($attemptUuid);

            return response()->json(['data' => $dto], 201);
        } catch (\InvalidArgumentException $e) {
            if (str_contains($e->getMessage(), 'EVALUATING') || str_contains($e->getMessage(), 'SCORED')) {
                return response()->json([
                    'type' => 'https://api.snapflect.com/errors/scoring-in-progress',
                    'title' => 'Scoring In Progress',
                    'status' => 409,
                    'detail' => 'The attempt is currently being scored.'
                ], 409);
            }
            if (str_contains($e->getMessage(), 'not found')) {
                return response()->json([
                    'type' => 'https://api.snapflect.com/errors/attempt-not-found',
                    'title' => 'Attempt Not Found',
                    'status' => 404,
                    'detail' => 'The attempt was not found or does not belong to your tenant.'
                ], 404);
            }
            return response()->json([
                'type' => 'https://api.snapflect.com/errors/attempt-not-submitted',
                'title' => 'Attempt Not Submitted',
                'status' => 400,
                'detail' => $e->getMessage()
            ], 400);
        }
    }

    public function recalculateScore(Request $request, string $attemptUuid): JsonResponse
    {
        // $tenantId = $this->contextResolver->resolveOrganizationId($request);
        // Add auth gates for Admin here

        try {
            // We bypass idempotency check and force a new version
            // In a real app we might pass a $force flag to orchestrator, or orchestrator handles versions naturally.
            // ResultPersistenceService already handles version incrementing!
            // However, orchestrator checks if status is SUBMITTED. Since it's SCORED, orchestrator will throw.
            // We need to bypass the SUBMITTED check in orchestrator or handle recalculation specifically.
            $dto = $this->orchestrator->executeScoringPipeline($attemptUuid, true);

            return response()->json(['data' => $dto], 201);
        } catch (\Exception $e) {
            return response()->json([
                'type' => 'https://api.snapflect.com/errors/recalculation-failed',
                'title' => 'Recalculation Failed',
                'status' => 400,
                'detail' => $e->getMessage()
            ], 400);
        }
    }
}
