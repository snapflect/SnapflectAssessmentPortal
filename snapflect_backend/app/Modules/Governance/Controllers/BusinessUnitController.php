<?php

declare(strict_types=1);

namespace App\Modules\Governance\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Modules\Governance\Services\BusinessUnitService;
use App\Modules\Governance\Requests\CreateBusinessUnitRequest;
use App\Modules\Governance\Requests\UpdateBusinessUnitRequest;
use App\Modules\Governance\Resources\BusinessUnitResource;
use App\Modules\Governance\Models\BusinessUnit;

class BusinessUnitController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly BusinessUnitService $businessUnitService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', BusinessUnit::class);
        
        $perPage = min(100, (int) $request->query('per_page', 15));
        
        if ($request->user()->roles->contains('role_code', 'PLATFORM_ADMIN')) {
            $businessUnits = $this->businessUnitService->paginate($perPage);
        } else {
            $organizationId = $request->user()->organization_id;
            $businessUnits = $this->businessUnitService->paginateByOrganization($organizationId, $perPage);
        }

        return response()->json(
            BusinessUnitResource::collection($businessUnits)->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function show(string $uuid): JsonResponse
    {
        $businessUnit = $this->businessUnitService->findByUuid($uuid);
        $this->authorize('view', $businessUnit);

        return response()->json(
            (new BusinessUnitResource($businessUnit))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function store(CreateBusinessUnitRequest $request): JsonResponse
    {
        $this->authorize('create', BusinessUnit::class);

        $businessUnit = $this->businessUnitService->create($request->toDto(), $request->user()->id);

        return response()->json(
            (new BusinessUnitResource($businessUnit))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function update(UpdateBusinessUnitRequest $request, string $uuid): JsonResponse
    {
        $businessUnit = $this->businessUnitService->findByUuid($uuid);
        $this->authorize('update', $businessUnit);

        $this->businessUnitService->update($uuid, $request->toDto(), $request->user()->id);
        $updatedBusinessUnit = $this->businessUnitService->findByUuid($uuid);

        return response()->json(
            (new BusinessUnitResource($updatedBusinessUnit))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function destroy(string $uuid, Request $request): JsonResponse
    {
        $businessUnit = $this->businessUnitService->findByUuid($uuid);
        $this->authorize('delete', $businessUnit);

        $this->businessUnitService->delete($uuid, $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Deleted successfully'
        ]);
    }
}
