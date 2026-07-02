<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Modules\Delivery\Models\AssessmentAttempt;
use App\Modules\Delivery\Services\AssessmentAttemptService;
use App\Modules\Delivery\Services\AttemptSubmissionService;
use App\Modules\Delivery\Requests\SubmitAssessmentRequest;
use App\Modules\Delivery\Requests\ExpireAttemptRequest;
use App\Modules\Delivery\Resources\AssessmentAttemptResource;

class AssessmentAttemptController extends Controller
{
    public function __construct(
        private readonly AssessmentAttemptService $attemptService,
        private readonly AttemptSubmissionService $submissionService
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

    public function progress(Request $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('view', $attempt);

        // Returning the resource implicitly includes progress attributes
        return response()->json([
            'success' => true,
            'message' => 'Assessment attempt progress retrieved successfully.',
            'data' => new AssessmentAttemptResource($attempt)
        ]);
    }

    public function submit(SubmitAssessmentRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('submit', $attempt);

        $result = $this->submissionService->submitAssessment($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Assessment attempt submitted successfully.',
            'data' => $result
        ]);
    }

    public function expire(ExpireAttemptRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('forceExpire', $attempt);

        $this->attemptService->expireAttempt($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Assessment attempt expired successfully.',
            'data' => null
        ]);
    }
}
