<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Assessment\Repositories\Interfaces\PublicationRepositoryInterface;
use App\Modules\Assessment\Resources\AssessmentPublicationResource;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Models\AssessmentPublication;
use App\Modules\Assessment\Requests\CreatePublicationRequest;
use App\Modules\Assessment\Services\AssessmentPublicationService;
use Illuminate\Http\JsonResponse;

class PublicationController extends Controller
{
    public function __construct(
        private PublicationRepositoryInterface $publicationRepo,
        private AssessmentPublicationService $publicationService
    ) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', AssessmentPublication::class);
        
        $publications = $this->publicationRepo->query()->with('assessment')->paginate();
        
        return response()->json([
            'success' => true,
            'message' => 'Publications retrieved successfully.',
            'data' => AssessmentPublicationResource::collection($publications)
        ]);
    }

    public function show(AssessmentPublication $publication): JsonResponse
    {
        $this->authorize('view', $publication);
        
        // Eager load snapshot specifically if needed
        return response()->json([
            'success' => true,
            'message' => 'Publication retrieved successfully.',
            'data' => AssessmentPublicationResource::make($publication->load('snapshot'))
        ]);
    }

    public function store(CreatePublicationRequest $request): JsonResponse
    {
        $this->authorize('create', AssessmentPublication::class);
        
        $user = $request->user();
        $organizationId = $user ? $user->organization_id : 1;
        $userId = $user ? $user->id : 1;
        
        $data = $request->validated();
        
        $result = $this->publicationService->publish($data['assessment_uuid'], $data, $organizationId, $userId);

        return response()->json([
            'success' => true,
            'message' => 'Publication created successfully.',
            'data' => $result
        ], 201);
    }
}
