<?php

declare(strict_types=1);

namespace App\Modules\Results\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Results\Services\LeaderboardService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LeaderboardController extends Controller
{
    public function __construct(
        private LeaderboardService $leaderboardService
    ) {}

    /**
     * GET /api/v1/leaderboards/{assessmentUuid}
     */
    public function show(string $assessmentUuid, Request $request): JsonResponse
    {
        // 1. Resolve context
        $currentUserUuid = $request->user()->uuid ?? null;

        // 2. Invoke Service (Service enforces Rule 2 Privacy Governance inside)
        $dtos = $this->leaderboardService->generateLeaderboard($assessmentUuid, $currentUserUuid, 50);

        // 3. Map DTOs & Return
        $data = array_map(fn($dto) => $dto->toArray(), $dtos);

        return response()->json(['data' => $data]);
    }

    /**
     * GET /api/v1/leaderboards/{assessmentUuid}/top
     */
    public function top(string $assessmentUuid, Request $request): JsonResponse
    {
        $dtos = $this->leaderboardService->generateLeaderboard($assessmentUuid, null, 3);
        $data = array_map(fn($dto) => $dto->toArray(), $dtos);

        return response()->json(['data' => $data]);
    }
}
