<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Delivery\Services\AssessmentAttemptService;
use App\Modules\Delivery\Services\AttemptTimerService;
use App\Modules\Delivery\Services\SubmissionEngineService;
use App\Modules\Delivery\DTOs\SubmitAttemptDto;
use App\Modules\Delivery\Requests\ExpireAttemptRequest;
use App\Modules\Delivery\Resources\AssessmentAttemptResource;

class AssessmentAttemptController extends Controller
{
    public function __construct(
        private readonly AssessmentAttemptService $attemptService,
        private readonly AttemptTimerService $timerService,
        private readonly SubmissionEngineService $submissionEngine
    ) {}

    public function show(Request $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('view', $attempt);

        return response()->json([
            'success' => true,
            'message' => 'Assessment attempt retrieved successfully.',
            'data' => new AssessmentAttemptResource($attempt)
        ]);
    }

    public function result(Request $request, AssessmentAttempt $attempt): JsonResponse
    {
        // Must be the owner or authorized
        if ($attempt->candidate_user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to this result.');
        }

        // Fetch result
        $result = \Illuminate\Support\Facades\DB::table('assessment_results')
            ->where('assessment_attempt_id', $attempt->id)
            ->latest('id')
            ->first();

        if (!$result) {
            return response()->json([
                'success' => true,
                'message' => 'Result is still processing.',
                'data' => [
                    'status' => 'PENDING'
                ]
            ], 200);
        }

        // Fetch competency scores
        $competencyScores = \Illuminate\Support\Facades\DB::table('competency_scores')
            ->join('competencies', 'competency_scores.competency_id', '=', 'competencies.id')
            ->where('competency_scores.assessment_result_id', $result->id)
            ->select('competency_scores.*', 'competencies.uuid as competency_uuid', 'competencies.competency_name')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Assessment result retrieved successfully.',
            'data' => [
                'uuid' => $result->uuid,
                'overall_score' => $result->overall_score,
                'overall_percentage' => $result->overall_percentage,
                'pass_fail_status' => $result->pass_fail_status,
                'status' => $result->status,
                'competency_scores' => $competencyScores,
            ]
        ]);
    }

    public function progress(Request $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('view', $attempt);

        // Telemetry tracking
        if ($attempt->session) {
            $session = $attempt->session;
            $session->last_activity_at = now();
            $session->ip_address = $request->ip();
            
            $clientTimestamp = $request->query('client_timestamp');
            if ($clientTimestamp) {
                // Approximate one-way latency
                $latency = now()->timestamp * 1000 + now()->millisecond - (int) $clientTimestamp;
                $session->latency_ms = max(0, $latency);
            }
            
            $session->save();
        }

        // Returning the resource implicitly includes progress attributes
        return response()->json([
            'success' => true,
            'message' => 'Assessment attempt progress retrieved successfully.',
            'data' => new AssessmentAttemptResource($attempt)
        ]);
    }

    public function submit(Request $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('submit', $attempt);

        $user = $request->user();
        $dto = new SubmitAttemptDto($attempt->uuid);

        $result = $this->submissionEngine->submitAttempt(
            $dto,
            $user->organization_id,
            $user->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Assessment attempt submitted successfully.',
            'data' => $result
        ]);
    }

    public function expire(ExpireAttemptRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('forceExpire', $attempt);

        $this->timerService->expireAttempt($attempt);

        return response()->json([
            'success' => true,
            'message' => 'Assessment attempt expired successfully.',
            'data' => null
        ]);
    }
}
