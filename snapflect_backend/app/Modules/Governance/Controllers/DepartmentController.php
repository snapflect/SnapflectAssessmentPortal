<?php

declare(strict_types=1);

namespace App\Modules\Governance\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Modules\Governance\Services\DepartmentService;
use App\Modules\Governance\Requests\CreateDepartmentRequest;
use App\Modules\Governance\Requests\UpdateDepartmentRequest;
use App\Modules\Governance\Resources\DepartmentResource;
use App\Modules\Governance\Models\Department;

class DepartmentController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly DepartmentService $departmentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Department::class);
        
        $perPage = min(100, (int) $request->query('per_page', 15));
        
        if ($request->user()->roles->contains('role_code', 'PLATFORM_ADMIN')) {
            $departments = $this->departmentService->paginate($perPage);
        } else {
            $organizationId = $request->user()->organization_id;
            $departments = $this->departmentService->paginateByOrganization($organizationId, $perPage);
        }

        return response()->json(
            DepartmentResource::collection($departments)->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function show(string $uuid): JsonResponse
    {
        $department = $this->departmentService->findByUuid($uuid);
        $this->authorize('view', $department);

        return response()->json(
            (new DepartmentResource($department))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function store(CreateDepartmentRequest $request): JsonResponse
    {
        $this->authorize('create', Department::class);

        $department = $this->departmentService->create($request->toDto(), $request->user()->id);

        return response()->json(
            (new DepartmentResource($department))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function update(UpdateDepartmentRequest $request, string $uuid): JsonResponse
    {
        $department = $this->departmentService->findByUuid($uuid);
        $this->authorize('update', $department);

        $this->departmentService->update($uuid, $request->toDto(), $request->user()->id);
        $updatedDepartment = $this->departmentService->findByUuid($uuid);

        return response()->json(
            (new DepartmentResource($updatedDepartment))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function destroy(string $uuid, Request $request): JsonResponse
    {
        $department = $this->departmentService->findByUuid($uuid);
        $this->authorize('delete', $department);

        $this->departmentService->delete($uuid, $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Deleted successfully'
        ]);
    }
}
