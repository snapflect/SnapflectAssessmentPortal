<?php

declare(strict_types=1);

namespace App\Modules\Security\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Modules\Security\Services\PermissionService;
use App\Modules\Security\Requests\CreatePermissionRequest;
use App\Modules\Security\Requests\UpdatePermissionRequest;
use App\Modules\Security\Resources\PermissionResource;
use App\Modules\Security\Models\Permission;

class PermissionController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly PermissionService $permissionService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Permission::class);
        
        $perPage = min(100, (int) $request->query('per_page', 15));
        $permissions = $this->permissionService->paginate($perPage);

        return response()->json(
            PermissionResource::collection($permissions)->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function show(string $uuid): JsonResponse
    {
        $permission = $this->permissionService->findByUuid($uuid);
        $this->authorize('view', $permission);

        return response()->json(
            (new PermissionResource($permission))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function store(CreatePermissionRequest $request): JsonResponse
    {
        $this->authorize('create', Permission::class);

        $permission = $this->permissionService->create($request->toDto(), $request->user()->id);

        return response()->json(
            (new PermissionResource($permission))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function update(UpdatePermissionRequest $request, string $uuid): JsonResponse
    {
        $permission = $this->permissionService->findByUuid($uuid);
        $this->authorize('update', $permission);

        $this->permissionService->update($uuid, $request->toDto(), $request->user()->id);
        $updatedPermission = $this->permissionService->findByUuid($uuid);

        return response()->json(
            (new PermissionResource($updatedPermission))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function destroy(string $uuid, Request $request): JsonResponse
    {
        $permission = $this->permissionService->findByUuid($uuid);
        $this->authorize('delete', $permission);

        $this->permissionService->delete($uuid, $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Deleted successfully'
        ]);
    }
}
