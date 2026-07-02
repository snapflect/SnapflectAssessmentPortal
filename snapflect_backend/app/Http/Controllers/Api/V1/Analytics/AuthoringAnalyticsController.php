<?php

namespace App\Http\Controllers\Api\V1\Analytics;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\Assessment\Models\Question;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Models\AssessmentPublication;

class AuthoringAnalyticsController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $organizationId = $request->user()->organization_id;

        $totalQuestions = Question::where('organization_id', $organizationId)->count();
        $draftQuestions = Question::where('organization_id', $organizationId)
            ->where('status', 'DRAFT')
            ->count();
        
        $totalAssessments = Assessment::where('organization_id', $organizationId)->count();
        $activePublications = AssessmentPublication::where('organization_id', $organizationId)
            ->where('status', 'ACTIVE')
            ->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_questions' => $totalQuestions,
                'draft_questions' => $draftQuestions,
                'total_assessments' => $totalAssessments,
                'active_publications' => $activePublications,
                'charts' => [
                    'competencyCoverage' => [
                        'categories' => ['Communication', 'Leadership', 'Technical', 'Problem Solving', 'Ethics'],
                        'series' => [
                            ['name' => 'Questions Count', 'data' => [45, 30, 80, 50, 20]]
                        ]
                    ]
                ]
            ]
        ]);
    }
}
