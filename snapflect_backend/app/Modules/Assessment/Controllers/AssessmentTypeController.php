<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Assessment\Requests\CreateAssessmentTypeRequest;
use App\Modules\Assessment\Requests\UpdateAssessmentTypeRequest;
use App\Modules\Assessment\Services\AssessmentService;
use App\Modules\Assessment\Repositories\Interfaces\AssessmentTypeRepositoryInterface;
use App\Modules\Assessment\Resources\AssessmentTypeResource;
use App\Modules\Assessment\Models\AssessmentType;
use Illuminate\Http\JsonResponse;

class AssessmentTypeController extends Controller
{
    public function __construct(
        private AssessmentService $service,
        private AssessmentTypeRepositoryInterface $repository
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

    public function show(AssessmentType $uuid): JsonResponse
    {
        $this->authorize('view', $uuid);
        
        return response()->json([
            'success' => true,
            'message' => 'Record retrieved successfully.',
            'data' => AssessmentTypeResource::make($uuid)
        ]);
    }

    public function store(CreateAssessmentTypeRequest $request): JsonResponse
    {
        $this->authorize('create', AssessmentType::class);
        
        $data = $request->toDto()->toArray();
        if (empty($data['type_code'])) {
            $baseCode = \Illuminate\Support\Str::slug($data['type_name']);
            $code = $baseCode;
            $counter = 1;
            while (\App\Modules\Assessment\Models\AssessmentType::where('type_code', $code)->whereNull('deleted_date')->exists()) {
                $code = $baseCode . '-' . $counter;
                $counter++;
            }
            $data['type_code'] = $code;
        }
        $data['organization_id'] = auth()->user()->organization_id;
        $data['created_by'] = auth()->id();
        $data['uuid'] = (string) \Illuminate\Support\Str::uuid();
        $data['status'] = $request->input('status', 'ACTIVE');

        $record = $this->repository->create($data);
        
        return response()->json([
            'success' => true,
            'message' => 'Record created successfully.',
            'data' => AssessmentTypeResource::make($record)
        ], 201);
    }

    public function update(UpdateAssessmentTypeRequest $request, AssessmentType $uuid): JsonResponse
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
            'data' => AssessmentTypeResource::make($this->repository->findById($uuid->id))
        ]);
    }

    public function destroy(AssessmentType $uuid): JsonResponse
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
