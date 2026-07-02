<?php

namespace App\Http\Controllers\Api\V1\Analytics;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\Delivery\Models\AssessmentAttempt;

class ReviewerAnalyticsController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $organizationId = $request->user()->organization_id;

        // Pending manual scoring: attempts submitted but not published
        $pendingReviews = AssessmentAttempt::where('organization_id', $organizationId)
            ->where('status', 'SUBMITTED')
            ->count();
        
        $completedReviews = AssessmentAttempt::where('organization_id', $organizationId)
            ->where('status', 'PUBLISHED')
            ->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'pending_reviews' => $pendingReviews,
                'completed_reviews' => $completedReviews,
            ]
        ]);
    }
}
