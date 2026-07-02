<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Assessment\Requests\CreateAssessmentRequest;
use App\Modules\Assessment\Requests\UpdateAssessmentRequest;
use App\Modules\Assessment\Requests\CreateAssessmentReviewRequest;
use App\Modules\Assessment\Requests\PublishAssessmentRequest;
use App\Modules\Assessment\Requests\CloneAssessmentRequest;
use App\Modules\Assessment\Services\AssessmentService;
use App\Modules\Assessment\Services\PublishingService;
use App\Modules\Assessment\Services\AssessmentCloneService;
use App\Modules\Assessment\Repositories\Interfaces\AssessmentRepositoryInterface;
use App\Modules\Assessment\Resources\AssessmentResource;
use App\Modules\Assessment\Models\Assessment;
use Illuminate\Http\JsonResponse;

class AssessmentController extends Controller
{
    public function __construct(
        private AssessmentService $assessmentService,
        private PublishingService $publishingService,
        private AssessmentCloneService $cloneService,
        private AssessmentRepositoryInterface $assessmentRepo
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Assessment::class);
        $assessments = $this->assessmentRepo->paginateByOrganization(auth()->user()->organization_id);
        $assessments->load(['category', 'type']);
        
        return response()->json([
            'success' => true,
            'message' => 'Assessments retrieved successfully.',
            'data' => AssessmentResource::collection($assessments)
        ]);
    }

    public function show(Assessment $uuid): JsonResponse
    {
        $this->authorize('view', $uuid);
        
        return response()->json([
            'success' => true,
            'message' => 'Assessment retrieved successfully.',
            'data' => AssessmentResource::make($uuid)
        ]);
    }

    public function store(CreateAssessmentRequest $request): JsonResponse
    {
        $this->authorize('create', Assessment::class);
        
        $assessmentData = $this->assessmentService->createAssessment(auth()->user()->organization_id, $request->toDto());
        $assessment = $this->assessmentRepo->findById($assessmentData['id']);
        
        return response()->json([
            'success' => true,
            'message' => 'Assessment created successfully.',
            'data' => AssessmentResource::make($assessment)
        ], 201);
    }

    public function update(UpdateAssessmentRequest $request, Assessment $uuid): JsonResponse
    {
        $this->authorize('update', $uuid);
        
        $this->assessmentService->updateAssessment($uuid->id, $request->toDto());
        
        return response()->json([
            'success' => true,
            'message' => 'Assessment updated successfully.',
            'data' => AssessmentResource::make($this->assessmentRepo->findById($uuid->id))
        ]);
    }

    public function destroy(Assessment $uuid): JsonResponse
    {
        $this->authorize('delete', $uuid);
        
        $this->assessmentService->deleteAssessment($uuid->id);
        
        return response()->json([
            'success' => true,
            'message' => 'Assessment deleted successfully.',
            'data' => []
        ]);
    }

    public function submitReview(Assessment $uuid): JsonResponse
    {
        $this->authorize('submitReview', $uuid);
        
        $this->assessmentService->submitForReview($uuid->id);
        
        return response()->json([
            'success' => true,
            'message' => 'Assessment submitted for review.',
            'data' => AssessmentResource::make($this->assessmentRepo->findById($uuid->id))
        ]);
    }

    public function approve(\Illuminate\Http\Request $request, Assessment $uuid): JsonResponse
    {
        $this->authorize('approve', $uuid);
        
        $this->assessmentService->approveAssessment($uuid->id);
        
        return response()->json([
            'success' => true,
            'message' => 'Assessment approved successfully.',
            'data' => AssessmentResource::make($this->assessmentRepo->findById($uuid->id))
        ]);
    }

    public function reject(\Illuminate\Http\Request $request, Assessment $uuid): JsonResponse
    {
        $this->authorize('approve', $uuid);
        
        $this->assessmentService->rejectAssessment($uuid->id);
        
        return response()->json([
            'success' => true,
            'message' => 'Assessment rejected.',
            'data' => AssessmentResource::make($this->assessmentRepo->findById($uuid->id))
        ]);
    }

    public function publish(PublishAssessmentRequest $request, Assessment $uuid): JsonResponse
    {
        $this->authorize('publish', $uuid);
        
        $this->publishingService->publish($request->toDto(), auth()->id());
        
        return response()->json([
            'success' => true,
            'message' => 'Assessment published successfully.',
            'data' => AssessmentResource::make($this->assessmentRepo->findById($uuid->id))
        ]);
    }

    public function archive(Assessment $uuid): JsonResponse
    {
        $this->authorize('archive', $uuid);
        
        $this->assessmentService->archive($uuid->id);
        
        return response()->json([
            'success' => true,
            'message' => 'Assessment archived successfully.',
            'data' => AssessmentResource::make($this->assessmentRepo->findById($uuid->id))
        ]);
    }

    public function clone(CloneAssessmentRequest $request, Assessment $uuid): JsonResponse
    {
        $this->authorize('create', Assessment::class);
        
        $clonedData = $this->cloneService->cloneAssessment($request->toDto(), auth()->id());
        
        return response()->json([
            'success' => true,
            'message' => 'Assessment cloned successfully.',
            'data' => AssessmentResource::make($this->assessmentRepo->findById($clonedData['id']))
        ], 201);
    }
}
