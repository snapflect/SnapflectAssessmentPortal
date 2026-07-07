<?php

namespace App\Http\Controllers\Api\V1\Analytics;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\Assessment\Models\Question;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Models\AssessmentPublication;
use App\Modules\Assessment\Models\Competency;

class AuthoringAnalyticsController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $organizationId = $request->user()->organization_id;

        $totalQuestions = Question::where('organization_id', $organizationId)
            ->where('is_deleted', false)
            ->count();
        $draftQuestions = Question::where('organization_id', $organizationId)
            ->where('status', 'DRAFT')
            ->where('is_deleted', false)
            ->count();
        
        $totalAssessments = Assessment::where('organization_id', $organizationId)
            ->where('is_deleted', false)
            ->count();
        $activePublications = AssessmentPublication::where('organization_id', $organizationId)
            ->where('status', 'ACTIVE')
            ->where('is_deleted', false)
            ->count();

        $competencies = Competency::where('organization_id', $organizationId)
            ->where('is_deleted', false)
            ->withCount(['questions' => function ($query) {
                $query->where('questions.is_deleted', false);
            }])
            ->whereHas('questions', function ($query) {
                $query->where('questions.is_deleted', false);
            })
            ->orderByDesc('questions_count')
            ->take(5)
            ->get();

        $categories = $competencies->pluck('competency_name')->toArray();
        $seriesData = $competencies->pluck('questions_count')->toArray();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_questions' => $totalQuestions,
                'draft_questions' => $draftQuestions,
                'total_assessments' => $totalAssessments,
                'active_publications' => $activePublications,
                'charts' => [
                    'competencyCoverage' => [
                        'categories' => $categories,
                        'series' => [
                            ['name' => 'Questions Count', 'data' => $seriesData]
                        ]
                    ]
                ]
            ]
        ]);
    }
}
