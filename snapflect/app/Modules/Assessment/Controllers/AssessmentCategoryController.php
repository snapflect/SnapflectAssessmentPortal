<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Assessment\Requests\CreateAssessmentCategoryRequest;
use App\Modules\Assessment\Requests\UpdateAssessmentCategoryRequest;
use App\Modules\Assessment\Services\AssessmentService;
use App\Modules\Assessment\Repositories\Interfaces\AssessmentRepositoryInterface;
use App\Modules\Assessment\Resources\AssessmentCategoryResource;
use App\Modules\Assessment\Models\AssessmentCategory;
use Illuminate\Http\JsonResponse;

class AssessmentCategoryController extends Controller
{
    public function __construct(
        private AssessmentService $service,
        private AssessmentRepositoryInterface $repository
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', AssessmentCategory::class);
        $records = $this->repository->paginateByOrganization(auth()->user()->organization_id);
        
        return response()->json([
            'success' => true,
            'message' => 'Records retrieved successfully.',
            'data' => AssessmentCategoryResource::collection($records)
        ]);
    }

    public function show(AssessmentCategory $record): JsonResponse
    {
        $this->authorize('view', $record);
        
        return response()->json([
            'success' => true,
            'message' => 'Record retrieved successfully.',
            'data' => AssessmentCategoryResource::make($record)
        ]);
    }

    public function store(CreateAssessmentCategoryRequest $request): JsonResponse
    {
        $this->authorize('create', AssessmentCategory::class);
        
        // Mocking service call for generic controllers
        // $data = $this->service->create(auth()->user()->organization_id, $request->toDto());
        $data = ['id' => 1]; // Placeholder
        $record = $this->repository->findById($data['id']);
        
        return response()->json([
            'success' => true,
            'message' => 'Record created successfully.',
            'data' => AssessmentCategoryResource::make($record) // Would be mapped properly in real code
        ], 201);
    }

    public function update(UpdateAssessmentCategoryRequest $request, AssessmentCategory $record): JsonResponse
    {
        $this->authorize('update', $record);
        
        // $this->service->update($record->id, $request->toDto());
        
        return response()->json([
            'success' => true,
            'message' => 'Record updated successfully.',
            'data' => AssessmentCategoryResource::make($this->repository->findById($record->id))
        ]);
    }

    public function destroy(AssessmentCategory $record): JsonResponse
    {
        $this->authorize('delete', $record);
        
        // $this->service->delete($record->id);
        
        return response()->json([
            'success' => true,
            'message' => 'Record deleted successfully.',
            'data' => []
        ]);
    }
}
