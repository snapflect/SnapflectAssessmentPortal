<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Delivery\Models\AssessmentSession;
use App\Modules\Delivery\Resources\CandidateAssessmentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CandidateDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $organizationId = $user ? $user->organization_id : 1;
        $candidateUserId = $user ? $user->id : 1;

        $sessions = AssessmentSession::where('candidate_user_id', $candidateUserId)
            ->where('organization_id', $organizationId)
            // Ensure we load the assessment and its active publication to determine the window
            ->with(['assessment', 'assessment.activePublication', 'attempt'])
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Candidate assessments retrieved successfully.',
            'data' => CandidateAssessmentResource::collection($sessions)
        ]);
    }
}
