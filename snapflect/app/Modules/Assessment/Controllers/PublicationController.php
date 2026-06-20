<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Assessment\Repositories\Interfaces\PublicationRepositoryInterface;
use App\Modules\Assessment\Resources\AssessmentPublicationResource;
use App\Modules\Assessment\Models\Assessment;
use App\Modules\Assessment\Models\AssessmentPublication;
use Illuminate\Http\JsonResponse;

class PublicationController extends Controller
{
    public function __construct(
        private PublicationRepositoryInterface $publicationRepo
    ) {}

    public function index(Assessment $assessment): JsonResponse
    {
        $this->authorize('view', $assessment);
        
        $publications = $this->publicationRepo->findPublicationHistory($assessment->id);
        
        return response()->json([
            'success' => true,
            'message' => 'Publications retrieved successfully.',
            'data' => AssessmentPublicationResource::collection($publications)
        ]);
    }

    public function show(Assessment $assessment, AssessmentPublication $publication): JsonResponse
    {
        $this->authorize('view', $assessment);
        
        // Eager load snapshot specifically if needed
        return response()->json([
            'success' => true,
            'message' => 'Publication retrieved successfully.',
            'data' => AssessmentPublicationResource::make($publication->load('snapshot'))
        ]);
    }
}
