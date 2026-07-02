<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Assessment\Services\AssessmentValidationService;
use App\Modules\Assessment\Resources\ValidationResultResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssessmentValidationController extends Controller
{
    public function __construct(
        private readonly AssessmentValidationService $validationService
    ) {
    }

    public function validate(Request $request, string $uuid): JsonResponse
    {
        // Get injected user context (assuming middleware injects user or we get from auth)
        $user = $request->user();
        $organizationId = $user ? $user->organization_id : 1; // Default to 1 for scaffold testing if no auth
        $userId = $user ? $user->id : 1;

        $result = $this->validationService->validate($uuid, $organizationId, $userId);

        return response()->json([
            'success' => true,
            'data' => new ValidationResultResource($result),
            'message' => 'Assessment validation executed successfully'
        ]);
    }

    public function getReport(Request $request, string $uuid): JsonResponse
    {
        // Because there is no assessment_validation_reports table yet, we execute real-time
        $user = $request->user();
        $organizationId = $user ? $user->organization_id : 1; 
        $userId = $user ? $user->id : 1;

        $result = $this->validationService->validate($uuid, $organizationId, $userId);

        return response()->json([
            'success' => true,
            'data' => new ValidationResultResource($result),
            'message' => 'Validation report retrieved successfully'
        ]);
    }
}
