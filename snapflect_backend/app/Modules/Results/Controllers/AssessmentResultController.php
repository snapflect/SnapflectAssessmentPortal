<?php

declare(strict_types=1);

namespace App\Modules\Results\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Results\Models\AssessmentResult;
use App\Modules\Results\Services\ResultService;
use App\Modules\Results\Requests\CalculateResultRequest;
use App\Modules\Results\Requests\RecalculateResultRequest;
use App\Modules\Results\Resources\AssessmentResultResource;
use App\Modules\Results\Resources\QuestionScoreResource;
use App\Modules\Results\Resources\SectionScoreResource;
use App\Modules\Results\Resources\CompetencyScoreResource;
use App\Modules\Results\Resources\ResultSnapshotResource;
use App\Modules\Results\Resources\ResultAuditResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssessmentResultController extends Controller
{
    public function __construct(private readonly ResultService $resultService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', AssessmentResult::class);

        $perPage = $request->query('per_page', 20);
        
        $query = AssessmentResult::with(['candidate', 'assessment'])
            ->where('is_deleted', 0)
            ->orderBy('calculated_at', 'desc')
            ->orderBy('created_date', 'desc');
            
        // If the user is a CLIENT_ADMIN, scope it
        if ($request->user() && $request->user()->roles()->where('role_code', 'CLIENT_ADMIN')->exists()) {
            $query->where('organization_id', $request->user()->organization_id);
        }

        $results = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Results retrieved successfully.',
            'data' => AssessmentResultResource::collection($results->items()),
            'meta' => [
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total()
            ]
        ]);
    }

    public function show(AssessmentResult $result): JsonResponse
    {
        $this->authorize('view', $result);

        return response()->json([
            'success' => true,
            'message' => 'Result retrieved successfully.',
            'data' => new AssessmentResultResource($result)
        ]);
    }

    public function calculate(CalculateResultRequest $request): JsonResponse
    {
        $this->authorize('calculate', AssessmentResult::class);

        $result = $this->resultService->calculate(
            $request->toDto(),
            $request->user()->organization_id,
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Result calculated successfully.',
            'data' => new AssessmentResultResource($result)
        ], 201);
    }

    public function recalculate(RecalculateResultRequest $request, AssessmentResult $result): JsonResponse
    {
        $this->authorize('recalculate', $result);

        $recalculatedResult = $this->resultService->recalculate(
            $request->toDto(),
            $request->user()->organization_id,
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Result recalculated successfully.',
            'data' => new AssessmentResultResource($recalculatedResult)
        ]);
    }

    public function questionScores(AssessmentResult $result): JsonResponse
    {
        $this->authorize('view', $result);

        return response()->json([
            'success' => true,
            'message' => 'Question scores retrieved successfully.',
            'data' => QuestionScoreResource::collection($result->questionScores)
        ]);
    }

    public function sectionScores(AssessmentResult $result): JsonResponse
    {
        $this->authorize('view', $result);

        return response()->json([
            'success' => true,
            'message' => 'Section scores retrieved successfully.',
            'data' => SectionScoreResource::collection($result->sectionScores)
        ]);
    }

    public function competencyScores(AssessmentResult $result): JsonResponse
    {
        $this->authorize('view', $result);

        return response()->json([
            'success' => true,
            'message' => 'Competency scores retrieved successfully.',
            'data' => CompetencyScoreResource::collection($result->competencyScores)
        ]);
    }

    public function versions(AssessmentResult $result): JsonResponse
    {
        $this->authorize('view', $result);

        // Exposing versions mapped via AssessmentResultResource or generic formatting
        return response()->json([
            'success' => true,
            'message' => 'Result versions retrieved successfully.',
            'data' => $result->resultVersions
        ]);
    }

    public function snapshot(AssessmentResult $result): JsonResponse
    {
        $this->authorize('viewSnapshot', $result);

        return response()->json([
            'success' => true,
            'message' => 'Result snapshots retrieved successfully.',
            'data' => ResultSnapshotResource::collection($result->resultSnapshots)
        ]);
    }

    public function audits(AssessmentResult $result): JsonResponse
    {
        $this->authorize('viewAudit', $result);

        return response()->json([
            'success' => true,
            'message' => 'Result audits retrieved successfully.',
            'data' => ResultAuditResource::collection($result->resultAudits)
        ]);
    }
}
