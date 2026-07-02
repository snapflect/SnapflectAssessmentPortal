<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Delivery\Services\SessionLaunchService;
use App\Modules\Delivery\Resources\LaunchResultResource;
use App\Modules\Delivery\Models\AssessmentSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionLaunchController extends Controller
{
    public function __construct(
        private readonly SessionLaunchService $launchService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $organizationId = $request->user() ? $request->user()->organization_id : 1;
        $perPage = $request->input('per_page', 50);

        $sessions = AssessmentSession::where('organization_id', $organizationId)
            ->with(['candidate', 'assessment'])
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $sessions->items(),
            'meta' => [
                'current_page' => $sessions->currentPage(),
                'last_page' => $sessions->lastPage(),
                'per_page' => $sessions->perPage(),
                'total' => $sessions->total()
            ],
            'message' => 'Sessions retrieved successfully'
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'assessment_uuid' => 'required|uuid',
            'candidate_user_id' => 'required|integer' // Typically UUID but matching existing foreignId standard
        ]);

        $user = $request->user();
        $organizationId = $user ? $user->organization_id : 1;
        $userId = $user ? $user->id : 1;

        $result = $this->launchService->createSession(
            $validated['assessment_uuid'],
            (int)$validated['candidate_user_id'],
            $organizationId,
            $userId
        );

        return response()->json([
            'success' => true,
            'data' => ['session_uuid' => $result->sessionUuid],
            'message' => 'Session created successfully'
        ], 201);
    }

    public function launch(Request $request, string $session_uuid): JsonResponse
    {
        $user = $request->user();
        $organizationId = $user ? $user->organization_id : 1;
        $userId = $user ? $user->id : 1;

        $result = $this->launchService->launchSession($session_uuid, $organizationId, $userId);

        return response()->json([
            'success' => true,
            'data' => new LaunchResultResource($result),
            'message' => 'Session launched successfully'
        ]);
    }

    public function show(Request $request, string $session_uuid): JsonResponse
    {
        $user = $request->user();
        $organizationId = $user ? $user->organization_id : 1;

        $session = AssessmentSession::where('uuid', $session_uuid)
            ->where('organization_id', $organizationId)
            ->first();

        if (!$session) {
            return response()->json(['message' => 'Session not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'session_uuid' => $session->uuid,
                'status' => $session->session_status,
                'assessment_snapshot_id' => $session->assessment_snapshot_id
            ],
            'message' => 'Session retrieved successfully'
        ]);
    }
}
