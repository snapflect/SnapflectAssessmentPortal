<?php

declare(strict_types=1);

namespace App\Modules\Governance\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Modules\Governance\Services\LocationService;
use App\Modules\Governance\Requests\CreateLocationRequest;
use App\Modules\Governance\Requests\UpdateLocationRequest;
use App\Modules\Governance\Resources\LocationResource;
use App\Modules\Governance\Models\Location;

class LocationController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly LocationService $locationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Location::class);
        
        $perPage = min(100, (int) $request->query('per_page', 15));
        
        if ($request->user()->roles->contains('role_code', 'PLATFORM_ADMIN')) {
            $locations = $this->locationService->paginate($perPage);
        } else {
            $organizationId = $request->user()->organization_id;
            $locations = $this->locationService->paginateByOrganization($organizationId, $perPage);
        }

        return response()->json(
            LocationResource::collection($locations)->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function show(string $uuid): JsonResponse
    {
        $location = $this->locationService->findByUuid($uuid);
        $this->authorize('view', $location);

        return response()->json(
            (new LocationResource($location))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function store(CreateLocationRequest $request): JsonResponse
    {
        $this->authorize('create', Location::class);

        $location = $this->locationService->create($request->toDto(), $request->user()->id);

        return response()->json(
            (new LocationResource($location))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function update(UpdateLocationRequest $request, string $uuid): JsonResponse
    {
        $location = $this->locationService->findByUuid($uuid);
        $this->authorize('update', $location);

        $this->locationService->update($uuid, $request->toDto(), $request->user()->id);
        $updatedLocation = $this->locationService->findByUuid($uuid);

        return response()->json(
            (new LocationResource($updatedLocation))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function destroy(string $uuid, Request $request): JsonResponse
    {
        $location = $this->locationService->findByUuid($uuid);
        $this->authorize('delete', $location);

        $this->locationService->delete($uuid, $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Deleted successfully'
        ]);
    }
}
