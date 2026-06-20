<?php

declare(strict_types=1);

namespace App\Modules\Results\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Results\Models\AssessmentResult;
use App\Modules\Results\Models\ResultPublication;
use App\Modules\Results\Services\PublicationService;
use App\Modules\Results\Requests\PublishResultRequest;
use App\Modules\Results\Requests\ArchiveResultRequest;
use App\Modules\Results\Resources\ResultPublicationResource;
use Illuminate\Http\JsonResponse;

class ResultPublicationController extends Controller
{
    public function __construct(private readonly PublicationService $publicationService)
    {
    }

    public function publish(PublishResultRequest $request, AssessmentResult $result): JsonResponse
    {
        $this->authorize('publish', $result);

        $this->publicationService->publish(
            $request->toDto(),
            $request->user()->organization_id,
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Result published successfully.',
            'data' => null
        ]);
    }

    public function archive(ArchiveResultRequest $request, AssessmentResult $result): JsonResponse
    {
        $this->authorize('archive', $result);

        $this->publicationService->archive(
            $request->toDto(),
            $request->user()->organization_id,
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Result archived successfully.',
            'data' => null
        ]);
    }

    public function showPublication(ResultPublication $publication): JsonResponse
    {
        $this->authorize('viewPublication', $publication);

        return response()->json([
            'success' => true,
            'message' => 'Publication retrieved successfully.',
            'data' => new ResultPublicationResource($publication)
        ]);
    }
}
