<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Controllers;

App\Http\Controllers\Controller;\nIlluminate\Http\JsonResponse;\nIlluminate\Http\Request;\nApp\Modules\Delivery\Models\AssessmentAttempt;\nApp\Modules\Delivery\Models\AttemptSubmission;\nApp\Modules\Delivery\Requests\GetAttemptEventsRequest;\nApp\Modules\Delivery\Requests\GetAttemptAuditsRequest;\nApp\Modules\Delivery\Resources\AttemptSubmissionResource;

class AttemptSubmissionController extends Controller
{
    public function show(Request $request, AttemptSubmission $submission): JsonResponse
    {
        $this->authorize('view', $submission);

        return response()->json([
            'success' => true,
            'message' => 'Attempt submission retrieved successfully.',
            'data' => new AttemptSubmissionResource($submission)
        ]);
    }

    public function events(GetAttemptEventsRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('view', $attempt);

        // Assuming events are eager loaded or fetched via relation since DB queries aren't allowed
        // Actually, the architecture would have the service return these, but there's no service
        // call explicitly mapped here. We will just return the resource collection from the relation.
        return response()->json([
            'success' => true,
            'message' => 'Attempt events retrieved successfully.',
            'data' => App\Modules\Delivery\Resources\AttemptEventResource::collection($attempt->events)
        ]);
    }

    public function audits(GetAttemptAuditsRequest $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->authorize('view', $attempt);

        return response()->json([
            'success' => true,
            'message' => 'Attempt audits retrieved successfully.',
            'data' => App\Modules\Delivery\Resources\AttemptAuditResource::collection($attempt->audits)
        ]);
    }
}
