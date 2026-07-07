<?php

declare(strict_types=1);

namespace App\Modules\Results\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Results\Models\ManualScoreReview;
use App\Modules\Results\Services\ManualReviewService;
use App\Modules\Results\Requests\CreateManualReviewRequest;
use App\Modules\Results\Requests\UpdateManualReviewRequest;
use App\Modules\Results\Resources\ManualScoreReviewResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ManualReviewController extends Controller
{
    public function __construct(private readonly ManualReviewService $manualReviewService)
    {
    }

    public function pendingQueue(Request $request): JsonResponse
    {
        $this->authorize('viewAny', ManualScoreReview::class);

        $reviews = $this->manualReviewService->getPendingQueue(
            $request->user()->organization_id,
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Pending reviews retrieved successfully.',
            'data' => ManualScoreReviewResource::collection($reviews)
        ]);
    }

    public function lock(Request $request, ManualScoreReview $review): JsonResponse
    {
        $this->authorize('update', $review);

        try {
            $lockedReview = $this->manualReviewService->lockReview(
                $review->uuid,
                $request->user()->organization_id,
                $request->user()->id
            );
            
            $lockedReview->load([
                'assessmentResult.candidate', 
                'assessmentResult.assessment',
                'questionScore.question',
                'questionScore.attemptQuestion.answers'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Review locked successfully.',
                'data' => new ManualScoreReviewResource($lockedReview)
            ]);
        } catch (\App\Modules\Results\Exceptions\ManualReviewException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $e->getCode() ?: 409);
        }
    }

    public function index(string $resultUuid, Request $request): JsonResponse
    {
        $this->authorize('viewAny', ManualScoreReview::class);

        $result = \App\Modules\Results\Models\AssessmentResult::where('uuid', $resultUuid)->firstOrFail();
        
        $reviews = ManualScoreReview::with(['questionScore.question'])
            ->where('assessment_result_id', $result->id)
            ->where('is_deleted', 0)
            ->orderBy('created_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Manual reviews retrieved successfully.',
            'data' => ManualScoreReviewResource::collection($reviews)
        ]);
    }

    public function show(ManualScoreReview $review): JsonResponse
    {
        $this->authorize('view', $review);
        
        $review->load([
            'assessmentResult.candidate', 
            'assessmentResult.assessment',
            'questionScore.question',
            'questionScore.attemptQuestion.answers'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Manual review retrieved successfully.',
            'data' => new ManualScoreReviewResource($review)
        ]);
    }

    public function store(CreateManualReviewRequest $request): JsonResponse
    {
        $this->authorize('create', ManualScoreReview::class);

        $review = $this->manualReviewService->createReview(
            $request->toDto(),
            $request->user()->organization_id,
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Manual review created successfully.',
            'data' => new ManualScoreReviewResource($review)
        ], 201);
    }

    public function update(UpdateManualReviewRequest $request, ManualScoreReview $review): JsonResponse
    {
        $this->authorize('update', $review);

        $updatedReview = $this->manualReviewService->updateReview(
            $request->toDto(),
            $review->uuid,
            $request->user()->organization_id,
            $request->user()->id
        );
        
        $updatedReview->load([
            'assessmentResult.candidate', 
            'assessmentResult.assessment',
            'questionScore.question',
            'questionScore.attemptQuestion.answers'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Manual review updated successfully.',
            'data' => new ManualScoreReviewResource($updatedReview)
        ]);
    }
}
