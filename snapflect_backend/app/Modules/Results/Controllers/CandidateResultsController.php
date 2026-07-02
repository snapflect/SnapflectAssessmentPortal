<?php

declare(strict_types=1);

namespace App\Modules\Results\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Results\Resources\CandidateResultResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CandidateResultsController extends Controller
{
    /**
     * GET /api/v1/candidates/results/{resultUuid}
     *
     * @param string $resultUuid
     * @param Request $request
     * @return JsonResponse
     */
    public function show(string $resultUuid, Request $request): JsonResponse
    {
        // 1. Resolve Context
        $user = $request->user();

        // 2. Fetch Result
        $result = DB::table('assessment_results')
            ->join('assessment_attempts', 'assessment_results.assessment_attempt_id', '=', 'assessment_attempts.id')
            ->join('assessments', 'assessment_attempts.assessment_id', '=', 'assessments.id')
            ->where('assessment_results.uuid', $resultUuid)
            // Ensure candidate owns this result
            ->where('assessment_attempts.candidate_user_id', $user->id) 
            ->where('assessment_results.result_status', 'PUBLISHED')
            ->select(
                'assessment_results.*',
                'assessments.title as assessment_name',
                'assessments.snapshot_json' // Contains blueprint settings
            )
            ->first();

        if (!$result) {
            return response()->json([
                'type' => 'about:blank',
                'title' => 'Result Not Found',
                'status' => 404,
                'detail' => 'Result not found or not published.'
            ], 404);
        }

        // Mock blueprint resolution from snapshot_json for resource
        $result->blueprint = json_decode($result->snapshot_json, true)['visibility_rules'] ?? [
            'score_visibility' => true,
            'pass_fail_visibility' => true,
            'show_competencies' => true
        ];

        // 3. Return Resource (Enforces Visibility internally)
        return response()->json([
            'data' => new CandidateResultResource($result)
        ]);
    }

    /**
     * GET /api/v1/candidates/results/{resultUuid}/competencies
     */
    public function competencies(string $resultUuid, Request $request): JsonResponse
    {
        $result = DB::table('assessment_results')
            ->join('assessment_attempts', 'assessment_results.assessment_attempt_id', '=', 'assessment_attempts.id')
            ->join('assessments', 'assessment_attempts.assessment_id', '=', 'assessments.id')
            ->where('assessment_results.uuid', $resultUuid)
            ->where('assessment_results.result_status', 'PUBLISHED')
            ->select('assessments.snapshot_json')
            ->first();

        if (!$result) {
            return response()->json(['status' => 404, 'detail' => 'Not Found'], 404);
        }

        $blueprint = json_decode($result->snapshot_json, true)['visibility_rules'] ?? [];
        if (!($blueprint['show_competencies'] ?? true)) {
            // Rule: 403 Forbidden if visibility is restricted
            return response()->json([
                'type' => 'visibility-restricted',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'Competency visibility is disabled by the administrator.'
            ], 403);
        }

        $competencies = DB::table('competency_scores')
            ->where('assessment_result_id', function ($query) use ($resultUuid) {
                $query->select('id')->from('assessment_results')->where('uuid', $resultUuid);
            })
            ->get();

        return response()->json(['data' => $competencies]);
    }

    /**
     * GET /api/v1/candidates/results/history
     */
    public function history(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = $request->input('per_page', 20);

        $results = DB::table('assessment_results')
            ->join('assessment_attempts', 'assessment_results.assessment_attempt_id', '=', 'assessment_attempts.id')
            ->join('assessments', 'assessment_attempts.assessment_id', '=', 'assessments.id')
            ->where('assessment_attempts.candidate_user_id', $user->id)
            ->where('assessment_results.result_status', 'PUBLISHED')
            ->select(
                'assessment_results.*',
                'assessments.title as assessment_name',
                'assessments.snapshot_json' // Contains blueprint settings
            )
            ->orderBy('assessment_results.published_at', 'desc')
            ->paginate($perPage);

        // Map blueprint onto each item for CandidateResultResource
        $results->getCollection()->transform(function ($result) {
            $result->blueprint = json_decode($result->snapshot_json, true)['visibility_rules'] ?? [
                'score_visibility' => true,
                'pass_fail_visibility' => true,
                'show_competencies' => true
            ];
            return $result;
        });

        return CandidateResultResource::collection($results)->response();
    }
}
