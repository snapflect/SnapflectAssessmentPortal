<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Assessment\Services\VersionService;
use App\Modules\Assessment\Repositories\Interfaces\VersionRepositoryInterface;
use App\Modules\Assessment\Resources\AssessmentVersionResource;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Models\AssessmentVersion;
use Illuminate\Http\JsonResponse;

class VersionController extends Controller
{
    public function __construct(
        private VersionService $versionService,
        private VersionRepositoryInterface $versionRepo
    ) {}

    public function index(Assessment $assessment): JsonResponse
    {
        $this->authorize('view', $assessment);
        
        $versions = $this->versionRepo->findVersionHistory($assessment->id);
        
        return response()->json([
            'success' => true,
            'message' => 'Versions retrieved successfully.',
            'data' => AssessmentVersionResource::collection($versions)
        ]);
    }

    public function show(Assessment $assessment, AssessmentVersion $version): JsonResponse
    {
        $this->authorize('view', $assessment);
        
        return response()->json([
            'success' => true,
            'message' => 'Version retrieved successfully.',
            'data' => AssessmentVersionResource::make($version)
        ]);
    }

    public function history(Assessment $assessment): JsonResponse
    {
        $this->authorize('view', $assessment);
        
        $versions = $this->versionRepo->findVersionHistory($assessment->id);
        
        return response()->json([
            'success' => true,
            'message' => 'Version tree retrieved successfully.',
            'data' => AssessmentVersionResource::collection($versions)
        ]);
    }
}
