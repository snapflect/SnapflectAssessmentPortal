<?php

declare(strict_types=1);

namespace App\Modules\Results\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Modules\Results\Models\AssessmentResult;

class AdminAnalyticsController extends Controller
{
    /**
     * GET /api/v1/admin/analytics/assessments/{assessmentUuid}
     */
    public function assessmentSummary(string $assessmentUuid, Request $request): JsonResponse
    {
        $this->authorize('viewAny', AssessmentResult::class);
        // 2. Fetch Materialized View directly (O(1))
        $summary = DB::table('assessment_analytics_summary')
            ->where('assessment_uuid', $assessmentUuid)
            ->first();
            
        if (!$summary) {
            // Return empty KPI state if no summary generated yet
            return response()->json([
                'data' => [
                    'assessmentUuid' => $assessmentUuid,
                    'totalAttempts' => 0,
                    'passRatePercentage' => 0,
                    'averageScorePercentage' => 0
                ]
            ]);
        }

        return response()->json(['data' => $summary]);
    }

    /**
     * GET /api/v1/admin/analytics/competencies/{assessmentUuid}
     */
    public function competencySummaries(string $assessmentUuid, Request $request): JsonResponse
    {
        $this->authorize('viewAny', AssessmentResult::class);
        $summaries = DB::table('competency_analytics_summary')
            ->where('assessment_uuid', $assessmentUuid)
            ->get();

        return response()->json(['data' => $summaries]);
    }

    /**
     * GET /api/v1/admin/analytics/questions/{assessmentUuid}
     */
    public function questionSummaries(string $assessmentUuid, Request $request): JsonResponse
    {
        $this->authorize('viewAny', AssessmentResult::class);
        $summaries = DB::table('question_analytics_summary')
            ->where('assessment_uuid', $assessmentUuid)
            ->get();

        return response()->json(['data' => $summaries]);
    }
}
