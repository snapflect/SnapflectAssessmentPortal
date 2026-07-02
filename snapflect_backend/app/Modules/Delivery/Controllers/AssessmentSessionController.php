<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Modules\Delivery\Models\AssessmentSession;
use App\Modules\Delivery\Services\AssessmentSessionService;
use App\Modules\Delivery\Requests\LaunchAssessmentRequest;
use App\Modules\Delivery\Requests\ResumeSessionRequest;
use App\Modules\Delivery\Requests\TerminateSessionRequest;
use App\Modules\Delivery\Resources\AssessmentSessionResource;

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
