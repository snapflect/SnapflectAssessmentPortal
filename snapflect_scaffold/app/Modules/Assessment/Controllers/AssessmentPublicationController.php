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

    public function makeReady(Request $request, string $assessment_uuid): JsonResponse
    {
        $user = $request->user();
        $organizationId = $user ? $user->organization_id : 1; 
        $userId = $user ? $user->id : 1;

        $result = $this->publicationService->makeReady($assessment_uuid, $organizationId, $userId);

        return response()->json([
            'success' => true,
            'data' => new PublicationResultResource($result),
            'message' => 'Assessment transitioned to READY state successfully'
        ]);
    }

    public function publish(Request $request, string $assessment_uuid): JsonResponse
    {
        $user = $request->user();
        $organizationId = $user ? $user->organization_id : 1; 
        $userId = $user ? $user->id : 1;

        $result = $this->publicationService->publish($assessment_uuid, $organizationId, $userId);

        return response()->json([
            'success' => true,
            'data' => new PublicationResultResource($result),
            'message' => 'Assessment published successfully'
        ]);
    }

    public function archive(Request $request, string $assessment_uuid): JsonResponse
    {
        $user = $request->user();
        $organizationId = $user ? $user->organization_id : 1; 
        $userId = $user ? $user->id : 1;

        $result = $this->publicationService->archive($assessment_uuid, $organizationId, $userId);

        return response()->json([
            'success' => true,
            'data' => new PublicationResultResource($result),
            'message' => 'Assessment archived successfully'
        ]);
    }
}
