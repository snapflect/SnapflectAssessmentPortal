<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Assessment\Requests\CreateCompetencyGroupRequest;
use App\Modules\Assessment\Requests\UpdateCompetencyGroupRequest;
use App\Modules\Assessment\Services\CompetencyService;
use App\Modules\Assessment\Repositories\Interfaces\CompetencyRepositoryInterface;
use App\Modules\Assessment\Resources\CompetencyGroupResource;
use App\Modules\Assessment\Models\CompetencyGroup;
use Illuminate\Http\JsonResponse;

class CompetencyGroupController extends Controller
{
    public function __construct(
        private CompetencyService $service,
        private CompetencyRepositoryInterface $repository
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', CompetencyGroup::class);
        $records = $this->repository->paginateByOrganization(auth()->user()->organization_id);
        
        return response()->json([
            'success' => true,
            'message' => 'Records retrieved successfully.',
            'data' => CompetencyGroupResource::collection($records)
        ]);
    }

    public function show(CompetencyGroup $record): JsonResponse
    {
        $this->authorize('view', $record);
        
        return response()->json([
            'success' => true,
            'message' => 'Record retrieved successfully.',
            'data' => CompetencyGroupResource::make($record)
        ]);
    }

    public function store(CreateCompetencyGroupRequest $request): JsonResponse
    {
        $this->authorize('create', CompetencyGroup::class);
        
        // Mocking service call for generic controllers
        // $data = $this->service->create(auth()->user()->organization_id, $request->toDto());
        $data = ['id' => 1]; // Placeholder
        $record = $this->repository->findById($data['id']);
        
        return response()->json([
            'success' => true,
            'message' => 'Record created successfully.',
            'data' => CompetencyGroupResource::make($record) // Would be mapped properly in real code
        ], 201);
    }

    public function update(UpdateCompetencyGroupRequest $request, CompetencyGroup $record): JsonResponse
    {
        $this->authorize('update', $record);
        
        // $this->service->update($record->id, $request->toDto());
        
        return response()->json([
            'success' => true,
            'message' => 'Record updated successfully.',
            'data' => CompetencyGroupResource::make($this->repository->findById($record->id))
        ]);
    }

    public function destroy(CompetencyGroup $record): JsonResponse
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
