<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Controllers;

App\Http\Controllers\Controller;\nIlluminate\Http\JsonResponse;\nIlluminate\Http\Request;\nApp\Modules\Delivery\Models\AssessmentSession;\nApp\Modules\Delivery\Services\AssessmentSessionService;\nApp\Modules\Delivery\Requests\LaunchAssessmentRequest;\nApp\Modules\Delivery\Requests\ResumeSessionRequest;\nApp\Modules\Delivery\Requests\TerminateSessionRequest;\nApp\Modules\Delivery\Resources\AssessmentSessionResource;

class AssessmentSessionController extends Controller
{
    public function __construct(
        private readonly AssessmentSessionService $sessionService
    ) {}

    public function launch(LaunchAssessmentRequest $request): JsonResponse
    {
        // No explicit policy for launch as it creates the session, 
        // Candidate access is validated inside the service.
        $sessionData = $this->sessionService->launchAssessment($request->toDto($request->user()->uuid));

        return response()->json([
            'success' => true,
            'message' => 'Assessment session launched successfully.',
            'data' => $sessionData
        ]);
    }

    public function resume(ResumeSessionRequest $request, AssessmentSession $session): JsonResponse
    {
        $this->authorize('resume', $session);

        $sessionData = $this->sessionService->resumeSession($request->toDto($request->user()->uuid));

        return response()->json([
            'success' => true,
            'message' => 'Assessment session resumed successfully.',
            'data' => $sessionData
        ]);
    }

    public function terminate(TerminateSessionRequest $request, AssessmentSession $session): JsonResponse
    {
        $this->authorize('terminate', $session);

        $this->sessionService->terminateSession($request->toDto());

        return response()->json([
            'success' => true,
            'message' => 'Assessment session terminated successfully.',
            'data' => null
        ]);
    }

    public function show(Request $request, AssessmentSession $session): JsonResponse
    {
        $this->authorize('view', $session);

        return response()->json([
            'success' => true,
            'message' => 'Assessment session retrieved successfully.',
            'data' => new AssessmentSessionResource($session)
        ]);
    }
}
