<?php

declare(strict_types=1);

namespace App\Modules\Results\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Results\Services\ReportingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
// use App\Modules\Results\Requests\ResultFilterRequest; // Assuming a filter request handles DTO generation
use App\Modules\Results\DTOs\ResultFilterDto;

class ReportingController extends Controller
{
    public function __construct(private readonly ReportingService $reportingService)
    {
    }

    public function assessmentReport(Request $request): JsonResponse
    {
        $this->authorize('viewAny', \App\Modules\Results\Models\AssessmentResult::class);
        $dto = ResultFilterDto::fromArray($request->all());

        $report = $this->reportingService->assessmentReport(
            $dto,
            $request->user()->organization_id,
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Assessment report retrieved successfully.',
            'data' => $report
        ]);
    }

    public function competencyReport(Request $request): JsonResponse
    {
        $this->authorize('viewAny', \App\Modules\Results\Models\AssessmentResult::class);
        $dto = ResultFilterDto::fromArray($request->all());

        $report = $this->reportingService->competencyReport(
            $dto,
            $request->user()->organization_id,
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Competency report retrieved successfully.',
            'data' => $report
        ]);
    }

    public function passFailReport(Request $request): JsonResponse
    {
        $this->authorize('viewAny', \App\Modules\Results\Models\AssessmentResult::class);
        $dto = ResultFilterDto::fromArray($request->all());

        $report = $this->reportingService->passFailReport(
            $dto,
            $request->user()->organization_id,
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Pass/fail report retrieved successfully.',
            'data' => $report
        ]);
    }

    public function candidateReport(Request $request): JsonResponse
    {
        $this->authorize('viewAny', \App\Modules\Results\Models\AssessmentResult::class);
        $dto = ResultFilterDto::fromArray($request->all());

        $report = $this->reportingService->candidateReport(
            $dto,
            $request->user()->organization_id,
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Candidate report retrieved successfully.',
            'data' => $report
        ]);
    }
}
