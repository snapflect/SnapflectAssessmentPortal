<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Assessment\Requests\CreateCompetencyGroupRequest;
use App\Modules\Assessment\Requests\UpdateCompetencyGroupRequest;
use App\Modules\Assessment\Services\CompetencyService;
use App\Modules\Assessment\Repositories\Interfaces\CompetencyGroupRepositoryInterface;
use App\Modules\Assessment\Resources\CompetencyGroupResource;
use App\Modules\Assessment\Models\CompetencyGroup;
use Illuminate\Http\JsonResponse;

class CompetencyGroupController extends Controller
{
    public function __construct(
        private CompetencyService $service,
        private CompetencyGroupRepositoryInterface $repository
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

    public function show(CompetencyGroup $uuid): JsonResponse
    {
        $this->authorize('view', $uuid);
        
        return response()->json([
            'success' => true,
            'message' => 'Record retrieved successfully.',
            'data' => CompetencyGroupResource::make($uuid)
        ]);
    }

    public function store(CreateCompetencyGroupRequest $request): JsonResponse
    {
        $this->authorize('create', CompetencyGroup::class);
        
        $record = $this->service->createGroup(auth()->user()->organization_id, $request->toDto());
        
        return response()->json([
            'success' => true,
            'message' => 'Record created successfully.',
            'data' => CompetencyGroupResource::make($this->repository->findById($record->id))
        ], 201);
    }

    public function update(UpdateCompetencyGroupRequest $request, CompetencyGroup $uuid): JsonResponse
    {
        $this->authorize('update', $uuid);
        
        $this->service->updateGroup($uuid->id, $request->toDto());
        
        return response()->json([
            'success' => true,
            'message' => 'Record updated successfully.',
            'data' => CompetencyGroupResource::make($this->repository->findById($uuid->id))
        ]);
    }

    public function destroy(CompetencyGroup $uuid): JsonResponse
    {
        $this->authorize('delete', $uuid);
        
        $this->service->deleteGroup($uuid->id);
        
        return response()->json([
            'success' => true,
            'message' => 'Record deleted successfully.',
            'data' => []
        ]);
    }
}
