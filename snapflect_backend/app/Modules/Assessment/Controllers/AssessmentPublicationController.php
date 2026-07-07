<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Assessment\Services\AssessmentPublicationService;
use App\Modules\Assessment\Resources\PublicationResultResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssessmentPublicationController extends Controller
{
    public function __construct(
        private readonly AssessmentPublicationService $publicationService
    ) {
    }

    public function makeReady(Request $request, string $uuid): JsonResponse
    {
        $user = $request->user();
        $organizationId = $user ? $user->organization_id : 1; 
        $userId = $user ? $user->id : 1;

        $result = $this->publicationService->makeReady($uuid, $organizationId, $userId);

        return response()->json([
            'success' => true,
            'data' => new PublicationResultResource($result),
            'message' => 'Assessment transitioned to READY state successfully'
        ]);
    }

    public function publish(Request $request, string $uuid): JsonResponse
    {
        $user = $request->user();
        $organizationId = $user ? $user->organization_id : 1; 
        $userId = $user ? $user->id : 1;
        $schedulingData = $request->input('scheduling', []);
        $result = $this->publicationService->publish($uuid, $schedulingData, $organizationId, $userId);

        return response()->json([
            'success' => true,
            'data' => new PublicationResultResource($result),
            'message' => 'Assessment published successfully'
        ]);
    }

    public function archive(Request $request, string $uuid): JsonResponse
    {
        $user = $request->user();
        $organizationId = $user ? $user->organization_id : 1; 
        $userId = $user ? $user->id : 1;

        $result = $this->publicationService->archive($uuid, $organizationId, $userId);

        return response()->json([
            'success' => true,
            'data' => new PublicationResultResource($result),
            'message' => 'Assessment archived successfully'
        ]);
    }
}
