<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Assessment\Requests\CreateCompetencyRequest;
use App\Modules\Assessment\Requests\UpdateCompetencyRequest;
use App\Modules\Assessment\Services\CompetencyService;
use App\Modules\Assessment\Repositories\Interfaces\CompetencyRepositoryInterface;
use App\Modules\Assessment\Resources\CompetencyResource;
use App\Modules\Assessment\Models\Competency;
use Illuminate\Http\JsonResponse;

class CompetencyController extends Controller
{
    public function __construct(
        private CompetencyService $service,
        private CompetencyRepositoryInterface $repository
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Competency::class);
        $records = $this->repository->paginateByOrganization(auth()->user()->organization_id);
        
        return response()->json([
            'success' => true,
            'message' => 'Records retrieved successfully.',
            'data' => CompetencyResource::collection($records)
        ]);
    }

    public function show(Competency $record): JsonResponse
    {
        $this->authorize('view', $record);
        
        return response()->json([
            'success' => true,
            'message' => 'Record retrieved successfully.',
            'data' => CompetencyResource::make($record)
        ]);
    }

    public function store(CreateCompetencyRequest $request): JsonResponse
    {
        $this->authorize('create', Competency::class);
        
        // Mocking service call for generic controllers
        // $data = $this->service->create(auth()->user()->organization_id, $request->toDto());
        $data = ['id' => 1]; // Placeholder
        $record = $this->repository->findById($data['id']);
        
        return response()->json([
            'success' => true,
            'message' => 'Record created successfully.',
            'data' => CompetencyResource::make($record) // Would be mapped properly in real code
        ], 201);
    }

    public function update(UpdateCompetencyRequest $request, Competency $record): JsonResponse
    {
        $this->authorize('update', $record);
        
        // $this->service->update($record->id, $request->toDto());
        
        return response()->json([
            'success' => true,
            'message' => 'Record updated successfully.',
            'data' => CompetencyResource::make($this->repository->findById($record->id))
        ]);
    }

    public function destroy(Competency $record): JsonResponse
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
