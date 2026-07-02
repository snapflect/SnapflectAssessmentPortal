<?php

declare(strict_types=1);

namespace App\Modules\Governance\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Modules\Governance\Services\OrganizationService;
use App\Modules\Governance\Requests\CreateOrganizationRequest;
use App\Modules\Governance\Requests\UpdateOrganizationRequest;
use App\Modules\Governance\Resources\OrganizationResource;
use App\Modules\Governance\Models\Organization;

class OrganizationController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly OrganizationService $organizationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Organization::class);
        
        $perPage = min(100, (int) $request->query('per_page', 15));
        
        if ($request->user()->roles->contains('role_code', 'PLATFORM_ADMIN')) {
            $organizations = $this->organizationService->paginate($perPage);
        } else {
            // For ORG_ADMIN, only return their own organization.
            $organization = $this->organizationService->findByUuid($request->user()->organization->uuid ?? '');
            // Wrap it in a LengthAwarePaginator to match the paginate return type
            $organizations = new \Illuminate\Pagination\LengthAwarePaginator([$organization], 1, $perPage, 1);
        }

        return response()->json(
            OrganizationResource::collection($organizations)->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function show(string $uuid): JsonResponse
    {
        $organization = $this->organizationService->findByUuid($uuid);
        $this->authorize('view', $organization);

        return response()->json(
            (new OrganizationResource($organization))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function store(CreateOrganizationRequest $request): JsonResponse
    {
        $this->authorize('create', Organization::class);

        $organization = $this->organizationService->create($request->toDto(), $request->user()->id);

        return response()->json(
            (new OrganizationResource($organization))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function update(UpdateOrganizationRequest $request, string $uuid): JsonResponse
    {
        $organization = $this->organizationService->findByUuid($uuid);
        $this->authorize('update', $organization);

        $this->organizationService->update($uuid, $request->toDto(), $request->user()->id);
        $updatedOrganization = $this->organizationService->findByUuid($uuid);

        return response()->json(
            (new OrganizationResource($updatedOrganization))->additional([
                'success' => true,
                'message' => 'Operation completed successfully'
            ])
        );
    }

    public function destroy(string $uuid, Request $request): JsonResponse
    {
        $organization = $this->organizationService->findByUuid($uuid);
        $this->authorize('delete', $organization);

        $this->organizationService->delete($uuid, $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Deleted successfully'
        ]);
    }
}
