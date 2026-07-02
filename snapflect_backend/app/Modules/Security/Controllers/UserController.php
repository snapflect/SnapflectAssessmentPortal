<?php

declare(strict_types=1);

namespace App\Modules\Security\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Modules\Security\Services\UserService;
use App\Modules\Security\Requests\CreateUserRequest;
use App\Modules\Security\Requests\UpdateUserRequest;
use App\Modules\Security\Resources\UserResource;
use App\Modules\Security\Models\User;

class UserController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly UserService $userService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);
        
        $perPage = min(100, (int) $request->query('per_page', 15));
        
        $include = $request->query('include', '');
        $relations = [];
        if (str_contains($include, 'roles')) {
            $relations[] = 'roles';
        }
        
        if ($request->user()->roles->contains('role_code', 'PLATFORM_ADMIN')) {
             $users = $this->userService->paginate($perPage, $relations);
        } else {
             $organizationId = $request->user()->organization_id;
             $users = $this->userService->paginateByOrganization($organizationId, $perPage, $relations);
        }

        return response()->json(
            UserResource::collection($users)->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function show(string $uuid): JsonResponse
    {
        $user = $this->userService->findByUuid($uuid);
        $this->authorize('view', $user);

        return response()->json(
            (new UserResource($user))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function store(CreateUserRequest $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $user = $this->userService->create($request->toDto(), $request->user()->id);

        return response()->json(
            (new UserResource($user))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function update(UpdateUserRequest $request, string $uuid): JsonResponse
    {
        $user = $this->userService->findByUuid($uuid);
        $this->authorize('update', $user);

        $this->userService->update($uuid, $request->toDto(), $request->user()->id);
        $updatedUser = $this->userService->findByUuid($uuid);

        return response()->json(
            (new UserResource($updatedUser))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function destroy(string $uuid, Request $request): JsonResponse
    {
        $user = $this->userService->findByUuid($uuid);
        $this->authorize('delete', $user);

        $this->userService->delete($uuid, $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Deleted successfully'
        ]);
    }

    public function assignRole(Request $request, string $userUuid, string $roleUuid): JsonResponse
    {
        $user = $this->userService->findByUuid($userUuid);
        $this->authorize('assignRole', $user);

        $this->userService->assignRole($userUuid, $roleUuid, $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Role assigned successfully'
        ]);
    }

    public function revokeRole(Request $request, string $userUuid, string $roleUuid): JsonResponse
    {
        $user = $this->userService->findByUuid($userUuid);
        $this->authorize('revokeRole', $user);

        $this->userService->revokeRole($userUuid, $roleUuid, $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Role revoked successfully'
        ]);
    }
}
