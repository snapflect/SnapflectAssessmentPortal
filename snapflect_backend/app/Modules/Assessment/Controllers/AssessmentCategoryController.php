<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Assessment\Requests\CreateAssessmentCategoryRequest;
use App\Modules\Assessment\Requests\UpdateAssessmentCategoryRequest;
use App\Modules\Assessment\Services\AssessmentService;
use App\Modules\Assessment\Repositories\Interfaces\AssessmentCategoryRepositoryInterface;
use App\Modules\Assessment\Resources\AssessmentCategoryResource;
use App\Modules\Assessment\Models\AssessmentCategory;
use Illuminate\Http\JsonResponse;

class AssessmentCategoryController extends Controller
{
    public function __construct(
        private AssessmentService $service,
        private AssessmentCategoryRepositoryInterface $repository
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

    public function show(AssessmentCategory $uuid): JsonResponse
    {
        $this->authorize('view', $uuid);
        
        return response()->json([
            'success' => true,
            'message' => 'Record retrieved successfully.',
            'data' => AssessmentCategoryResource::make($uuid)
        ]);
    }

    public function store(CreateAssessmentCategoryRequest $request): JsonResponse
    {
        $this->authorize('create', AssessmentCategory::class);
        
        $data = $request->toDto()->toArray();
        $data['organization_id'] = auth()->user()->organization_id;
        $data['created_by'] = auth()->id();
        $data['uuid'] = (string) \Illuminate\Support\Str::uuid();
        $data['status'] = $request->input('status', 'ACTIVE');

        $record = $this->repository->create($data);
        
        return response()->json([
            'success' => true,
            'message' => 'Record created successfully.',
            'data' => AssessmentCategoryResource::make($record)
        ], 201);
    }

    public function update(UpdateAssessmentCategoryRequest $request, AssessmentCategory $uuid): JsonResponse
    {
        $this->authorize('update', $uuid);
        
        $data = $request->toDto()->toArray();
        if ($request->has('status')) {
            $data['status'] = $request->input('status');
        }
        $data['modified_by'] = auth()->id();

        $this->repository->update($uuid->id, $data);
        
        return response()->json([
            'success' => true,
            'message' => 'Record updated successfully.',
            'data' => AssessmentCategoryResource::make($this->repository->findById($uuid->id))
        ]);
    }

    public function destroy(AssessmentCategory $uuid): JsonResponse
    {
        $this->authorize('delete', $uuid);
        
        $this->repository->delete($uuid->id);
        
        return response()->json([
            'success' => true,
            'message' => 'Record deleted successfully.',
            'data' => []
        ]);
    }
}
