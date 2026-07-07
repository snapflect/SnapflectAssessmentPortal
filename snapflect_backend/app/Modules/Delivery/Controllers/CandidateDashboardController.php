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

        // Auto-create sessions for any assigned publications that don't have one yet
        $assignedPublications = \Illuminate\Support\Facades\DB::table('publication_candidates')
            ->where('candidate_id', $candidateUserId)
            ->join('assessment_publications', 'assessment_publications.id', '=', 'publication_candidates.publication_id')
            ->join('assessments', 'assessments.id', '=', 'assessment_publications.assessment_id')
            ->select('assessments.uuid as assessment_uuid', 'assessments.id as assessment_id', 'assessments.organization_id')
            ->get();

        foreach ($assignedPublications as $pub) {
            $exists = AssessmentSession::where('candidate_user_id', $candidateUserId)
                ->where('assessment_id', $pub->assessment_id)
                ->exists();

            if (!$exists) {
                try {
                    app(\App\Modules\Delivery\Services\SessionLaunchService::class)->createSession(
                        $pub->assessment_uuid,
                        $candidateUserId,
                        $pub->organization_id ?? 1,
                        $candidateUserId
                    );
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning('Auto-create session failed: ' . $e->getMessage());
                }
            }
        }

        $sessions = AssessmentSession::where('candidate_user_id', $candidateUserId)
            ->where('organization_id', $organizationId)
            // Ensure we load the assessment and its active publication to determine the window
            ->with(['assessment', 'assessment.activePublication', 'attempts', 'attempts.result'])
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Candidate assessments retrieved successfully.',
            'data' => CandidateAssessmentResource::collection($sessions)
        ]);
    }
}
