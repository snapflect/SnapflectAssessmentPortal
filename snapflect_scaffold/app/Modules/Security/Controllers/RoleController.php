<?php

declare(strict_types=1);

namespace App\Modules\Security\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Modules\Security\Services\RoleService;
use App\Modules\Security\Requests\CreateRoleRequest;
use App\Modules\Security\Requests\UpdateRoleRequest;
use App\Modules\Security\Resources\RoleResource;
use App\Modules\Security\Models\Role;

class RoleController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly RoleService $roleService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Role::class);
        
        $perPage = min(100, (int) $request->query('per_page', 15));
        // Using repository direct is banned. We rely on service.
        // Assuming service has paginate. If not, it will be added in service later.
        // As an orchestration layer, we map to service.
        $roles = $this->roleService->paginateByOrganization($request->user()->organization_id ?? 0, $perPage);

        return response()->json(
            RoleResource::collection($roles)->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function show(string $uuid): JsonResponse
    {
        $role = $this->roleService->findByUuid($uuid);
        $this->authorize('view', $role);

        return response()->json(
            (new RoleResource($role))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function store(CreateRoleRequest $request): JsonResponse
    {
        $this->authorize('create', Role::class);

        $role = $this->roleService->create($request->toDto(), $request->user()->id);

        return response()->json(
            (new RoleResource($role))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function update(UpdateRoleRequest $request, string $uuid): JsonResponse
    {
        $role = $this->roleService->findByUuid($uuid);
        $this->authorize('update', $role);

        $this->roleService->update($uuid, $request->toDto(), $request->user()->id);
        $updatedRole = $this->roleService->findByUuid($uuid);

        return response()->json(
            (new RoleResource($updatedRole))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function destroy(string $uuid, Request $request): JsonResponse
    {
        $role = $this->roleService->findByUuid($uuid);
        $this->authorize('delete', $role);

        $this->roleService->delete($uuid, $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Deleted successfully'
        ]);
    }
}
