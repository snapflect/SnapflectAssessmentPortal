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

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', ManualScoreReview::class);

        return response()->json([
            'success' => true,
            'message' => 'Manual reviews retrieved successfully.',
            'data' => []
        ]);
    }

    public function show(ManualScoreReview $manualReview): JsonResponse
    {
        $this->authorize('view', $manualReview);

        return response()->json([
            'success' => true,
            'message' => 'Manual review retrieved successfully.',
            'data' => new ManualScoreReviewResource($manualReview)
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

    public function update(UpdateManualReviewRequest $request, ManualScoreReview $manualReview): JsonResponse
    {
        $this->authorize('update', $manualReview);

        $updatedReview = $this->manualReviewService->updateReview(
            $request->toDto(),
            $request->user()->organization_id,
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Manual review updated successfully.',
            'data' => new ManualScoreReviewResource($updatedReview)
        ]);
    }
}
