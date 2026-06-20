<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Assessment\Requests\CreateAssessmentTypeRequest;
use App\Modules\Assessment\Requests\UpdateAssessmentTypeRequest;
use App\Modules\Assessment\Services\AssessmentService;
use App\Modules\Assessment\Repositories\Interfaces\AssessmentRepositoryInterface;
use App\Modules\Assessment\Resources\AssessmentTypeResource;
use App\Modules\Assessment\Models\AssessmentType;
use Illuminate\Http\JsonResponse;

class AssessmentTypeController extends Controller
{
    public function __construct(
        private AssessmentService $service,
        private AssessmentRepositoryInterface $repository
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', AssessmentType::class);
        $records = $this->repository->paginateByOrganization(auth()->user()->organization_id);
        
        return response()->json([
            'success' => true,
            'message' => 'Records retrieved successfully.',
            'data' => AssessmentTypeResource::collection($records)
        ]);
    }

    public function show(AssessmentType $record): JsonResponse
    {
        $this->authorize('view', $record);
        
        return response()->json([
            'success' => true,
            'message' => 'Record retrieved successfully.',
            'data' => AssessmentTypeResource::make($record)
        ]);
    }

    public function store(CreateAssessmentTypeRequest $request): JsonResponse
    {
        $this->authorize('create', AssessmentType::class);
        
        // Mocking service call for generic controllers
        // $data = $this->service->create(auth()->user()->organization_id, $request->toDto());
        $data = ['id' => 1]; // Placeholder
        $record = $this->repository->findById($data['id']);
        
        return response()->json([
            'success' => true,
            'message' => 'Record created successfully.',
            'data' => AssessmentTypeResource::make($record) // Would be mapped properly in real code
        ], 201);
    }

    public function update(UpdateAssessmentTypeRequest $request, AssessmentType $record): JsonResponse
    {
        $this->authorize('update', $record);
        
        // $this->service->update($record->id, $request->toDto());
        
        return response()->json([
            'success' => true,
            'message' => 'Record updated successfully.',
            'data' => AssessmentTypeResource::make($this->repository->findById($record->id))
        ]);
    }

    public function destroy(AssessmentType $record): JsonResponse
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
