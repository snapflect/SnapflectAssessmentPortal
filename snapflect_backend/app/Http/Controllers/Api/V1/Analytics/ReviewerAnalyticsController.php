<?php

namespace App\Http\Controllers\Api\V1\Analytics;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Modules\Results\Models\ManualScoreReview;

class ReviewerAnalyticsController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $organizationId = $request->user()->organization_id;
        $userId = $request->user()->id;

        // Pending manual scoring: records with PENDING or IN_REVIEW (if locked by this user)
        $pendingReviews = ManualScoreReview::where('organization_id', $organizationId)
            ->where(function ($query) use ($userId) {
                $query->where('review_status', 'PENDING')
                      ->orWhere(function ($q) use ($userId) {
                          $q->where('review_status', 'IN_REVIEW')
                            ->where('reviewed_by', $userId);
                      });
            })
            ->where('is_deleted', 0)
            ->count();
        
        // Completed reviews by this reviewer
        $completedReviews = ManualScoreReview::where('organization_id', $organizationId)
            ->where('review_status', 'COMPLETED')
            ->where('reviewed_by', $userId)
            ->where('is_deleted', 0)
            ->count();

        // Calculate average score awarded by this reviewer
        $avgScoreResult = DB::selectOne("
            SELECT AVG(
                CASE 
                    WHEN original_score > 0 THEN (reviewed_score / original_score) * 100 
                    ELSE 0 
                END
            ) as avg_score 
            FROM manual_score_reviews 
            WHERE organization_id = ? AND reviewed_by = ? AND review_status = 'COMPLETED' AND is_deleted = 0
        ", [$organizationId, $userId]);
        
        $averageScore = $avgScoreResult->avg_score ? round($avgScoreResult->avg_score) : 0;

        // Calculate actual turnaround time based on recent completed reviews
        $completedList = ManualScoreReview::where('organization_id', $organizationId)
            ->where('review_status', 'COMPLETED')
            ->where('reviewed_by', $userId)
            ->where('is_deleted', 0)
            ->whereNotNull('reviewed_at')
            ->orderBy('reviewed_at', 'desc')
            ->take(100)
            ->get(['created_date', 'reviewed_at']);

        $totalMinutes = 0;
        $count = $completedList->count();
        foreach($completedList as $review) {
            $created = \Carbon\Carbon::parse($review->created_date);
            $reviewed = \Carbon\Carbon::parse($review->reviewed_at);
            $totalMinutes += $reviewed->diffInMinutes($created);
        }
        
        $turnaroundTime = 'N/A';
        if ($count > 0) {
            $avgMinutes = $totalMinutes / $count;
            if ($avgMinutes < 60) {
                $turnaroundTime = round($avgMinutes) . 'm';
            } else {
                $turnaroundTime = round($avgMinutes / 60, 1) . 'h';
            }
        }

        // Priority queue (top 5 pending)
        $priorityQueueRaw = DB::select("
            SELECT msr.uuid as uuid, msr.created_date,
                   u.first_name || ' ' || u.last_name as candidate_name,
                   a.assessment_name as assessment_name,
                   msr.review_status as status
            FROM manual_score_reviews msr
            JOIN assessment_results ar ON msr.assessment_result_id = ar.id
            JOIN assessment_attempts aa ON ar.assessment_attempt_id = aa.id
            JOIN users u ON aa.candidate_user_id = u.id
            JOIN assessments a ON aa.assessment_id = a.id
            WHERE msr.organization_id = ? 
              AND (msr.review_status = 'PENDING' OR (msr.review_status = 'IN_REVIEW' AND msr.reviewed_by = ?))
              AND msr.is_deleted = 0
            ORDER BY msr.created_date ASC
            LIMIT 5
        ", [$organizationId, $userId]);

        $priorityQueue = array_map(function($row) {
            return [
                'uuid' => $row->uuid,
                'candidate_name' => $row->candidate_name,
                'assessment_name' => $row->assessment_name,
                'date_submitted' => \Carbon\Carbon::parse($row->created_date)->diffForHumans(),
                'status' => $row->status
            ];
        }, $priorityQueueRaw);

        return response()->json([
            'status' => 'success',
            'data' => [
                'pending_reviews' => $pendingReviews,
                'completed_reviews' => $completedReviews,
                'average_score_awarded' => $averageScore,
                'turnaround_time' => $turnaroundTime,
                'priority_queue' => $priorityQueue
            ]
        ]);
    }
}
