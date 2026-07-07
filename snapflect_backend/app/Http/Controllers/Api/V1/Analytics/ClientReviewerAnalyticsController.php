<?php

namespace App\Http\Controllers\Api\V1\Analytics;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\Security\Models\User;
use App\Modules\Results\Models\ManualScoreReview;
use App\Notifications\ReviewerReminderNotification;
use Illuminate\Support\Facades\DB;

class ClientReviewerAnalyticsController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $organizationId = $request->user()->organization_id;

        $reviewers = User::where('organization_id', $organizationId)
            ->whereHas('roles', function ($query) {
                $query->where('role_code', 'REVIEWER');
            })
            ->withCount([
                'manualScoreReviews as pending_reviews' => function ($query) {
                    $query->whereIn('review_status', ['PENDING', 'IN_REVIEW']);
                },
                'manualScoreReviews as completed_reviews' => function ($query) {
                    $query->where('review_status', 'COMPLETED');
                }
            ])
            ->get();

        $data = $reviewers->map(function ($reviewer) {
            return [
                'id' => $reviewer->id,
                'uuid' => $reviewer->uuid,
                'name' => trim($reviewer->first_name . ' ' . $reviewer->last_name),
                'email' => $reviewer->email,
                'pending_reviews' => $reviewer->pending_reviews,
                'completed_reviews' => $reviewer->completed_reviews,
                'total_assigned' => $reviewer->pending_reviews + $reviewer->completed_reviews,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    public function pending(Request $request, string $uuid): JsonResponse
    {
        $organizationId = $request->user()->organization_id;
        
        $reviewer = User::where('organization_id', $organizationId)
            ->where('uuid', $uuid)
            ->firstOrFail();

        $pendingReviews = ManualScoreReview::where('reviewed_by', $reviewer->id)
            ->whereIn('review_status', ['PENDING', 'IN_REVIEW'])
            ->with([
                'assessmentResult' => function($query) {
                    $query->select('id', 'uuid', 'assessment_id', 'candidate_user_id')
                          ->with(['assessment:id,name', 'candidate:id,first_name,last_name']);
                },
                'questionScore' => function($query) {
                    $query->select('id', 'uuid', 'question_id')
                          ->with('question:id,question_text');
                }
            ])
            ->get();

        $data = $pendingReviews->map(function ($review) {
            return [
                'uuid' => $review->uuid,
                'assessment_name' => $review->assessmentResult->assessment->name ?? 'Unknown Assessment',
                'candidate_name' => trim(($review->assessmentResult->candidate->first_name ?? '') . ' ' . ($review->assessmentResult->candidate->last_name ?? '')),
                'question_text' => $review->questionScore->question->question_text ?? 'Unknown Question',
                'status' => $review->review_status,
                'created_date' => $review->created_date,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    public function reassign(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'target_reviewer_uuid' => 'required|string|exists:users,uuid',
            'review_uuids' => 'required|array',
            'review_uuids.*' => 'string|exists:manual_score_reviews,uuid',
        ]);

        $organizationId = $request->user()->organization_id;

        $sourceReviewer = User::where('organization_id', $organizationId)
            ->where('uuid', $uuid)
            ->firstOrFail();

        $targetReviewer = User::where('organization_id', $organizationId)
            ->where('uuid', $request->target_reviewer_uuid)
            ->firstOrFail();

        if ($sourceReviewer->id === $targetReviewer->id) {
            return response()->json(['message' => 'Target reviewer cannot be the same as the source reviewer'], 422);
        }

        $updatedCount = ManualScoreReview::where('reviewed_by', $sourceReviewer->id)
            ->whereIn('review_status', ['PENDING', 'IN_REVIEW'])
            ->whereIn('uuid', $request->review_uuids)
            ->update([
                'reviewed_by' => $targetReviewer->id,
                'modified_by' => clone $request->user()->id ?? null,
                'modified_date' => now(),
            ]);

        if ($updatedCount > 0) {
            $targetReviewer->notify(new ReviewerReminderNotification());
        }

        return response()->json([
            'status' => 'success',
            'message' => "Successfully reassigned {$updatedCount} reviews.",
            'updated_count' => $updatedCount
        ]);
    }

    public function remind(Request $request, string $uuid): JsonResponse
    {
        $organizationId = $request->user()->organization_id;

        $reviewer = User::where('organization_id', $organizationId)
            ->where('uuid', $uuid)
            ->firstOrFail();

        $reviewer->notify(new ReviewerReminderNotification());

        return response()->json([
            'status' => 'success',
            'message' => 'Reminder sent successfully.'
        ]);
    }
}
