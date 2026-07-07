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
        
        $query = AssessmentResult::with(['candidate', 'assessment', 'assessmentAttempt'])
            ->where('is_deleted', 0)
            ->whereRaw('id = (SELECT MAX(id) FROM assessment_results ar2 WHERE ar2.assessment_attempt_id = assessment_results.assessment_attempt_id AND ar2.is_deleted = 0)')
            ->orderBy('calculated_at', 'desc')
            ->orderBy('created_date', 'desc');
            
        // If the user is a CLIENT_ADMIN, scope it
        if ($request->user() && $request->user()->roles()->where('role_code', 'CLIENT_ADMIN')->exists()) {
            $query->where('organization_id', $request->user()->organization_id);
        }

        if ($request->filled('assessment_uuid')) {
            $query->whereHas('assessment', function ($q) use ($request) {
                $q->where('uuid', $request->query('assessment_uuid'));
            });
        }

        if ($request->boolean('latest_attempt_per_candidate')) {
            // Only keep the result if its attempt is the LATEST attempt for this candidate + assessment
            $query->whereHas('assessmentAttempt', function ($q) {
                $q->whereRaw('assessment_attempts.id = (SELECT MAX(id) FROM assessment_attempts aa2 WHERE aa2.candidate_user_id = assessment_attempts.candidate_user_id AND aa2.assessment_id = assessment_attempts.assessment_id AND aa2.is_deleted = 0 AND aa2.status = "SCORED")');
            });
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

        $result->load([
            'questionScores.question',
            'sectionScores.section',
            'competencyScores.competency',
            'candidate',
            'assessment'
        ]);

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

    public function assessmentsSummary(Request $request): JsonResponse
    {
        $this->authorize('viewAny', AssessmentResult::class);
        
        $orgId = $request->user()->organization_id;

        // Group by assessment and aggregate attempts, but only the LATEST attempt per candidate
        $results = \Illuminate\Support\Facades\DB::table('assessment_attempts as aa')
            ->join('assessments as a', 'aa.assessment_id', '=', 'a.id')
            ->where('aa.organization_id', $orgId)
            ->where('aa.status', 'SCORED')
            ->where('aa.is_deleted', 0)
            ->whereRaw('aa.id = (SELECT MAX(id) FROM assessment_attempts aa2 WHERE aa2.candidate_user_id = aa.candidate_user_id AND aa2.assessment_id = aa.assessment_id AND aa2.is_deleted = 0 AND aa2.status = "SCORED")')
            ->select(
                'a.id as assessment_id',
                'a.uuid as assessment_uuid',
                'a.assessment_name',
                \Illuminate\Support\Facades\DB::raw('COUNT(aa.id) as total_candidates'),
                \Illuminate\Support\Facades\DB::raw('SUM(CASE WHEN aa.selection_status = "SELECTED" THEN 1 ELSE 0 END) as selected_count'),
                \Illuminate\Support\Facades\DB::raw('SUM(CASE WHEN aa.selection_status = "REJECTED" THEN 1 ELSE 0 END) as rejected_count'),
                \Illuminate\Support\Facades\DB::raw('SUM(CASE WHEN aa.selection_status = "PENDING" THEN 1 ELSE 0 END) as pending_count')
            )
            ->groupBy('a.id', 'a.uuid', 'a.assessment_name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $results
        ]);
    }

    public function updateSelectionStatus(Request $request, string $uuid): JsonResponse
    {
        // This is a candidate selection action.
        $this->authorize('viewAny', AssessmentResult::class);

        $request->validate([
            'selection_status' => 'required|in:PENDING,SELECTED,REJECTED'
        ]);

        $attempt = \App\Modules\Delivery\Models\AssessmentAttempt::where('uuid', $uuid)->firstOrFail();
        
        // Ensure same organization
        if ($attempt->organization_id !== $request->user()->organization_id) {
            abort(403, 'Unauthorized');
        }

        $attempt->selection_status = $request->selection_status;
        $attempt->save();

        return response()->json([
            'success' => true,
            'message' => 'Candidate selection status updated successfully.',
            'data' => [
                'uuid' => $attempt->uuid,
                'selection_status' => $attempt->selection_status
            ]
        ]);
    }

    public function exportSelectedCandidates(Request $request, string $assessment_uuid)
    {
        $this->authorize('viewAny', AssessmentResult::class);
        $orgId = $request->user()->organization_id;

        $results = AssessmentResult::with(['candidate', 'assessmentAttempt'])
            ->whereHas('assessment', function ($q) use ($assessment_uuid) {
                $q->where('uuid', $assessment_uuid);
            })
            ->whereHas('assessmentAttempt', function ($q) {
                $q->where('selection_status', 'SELECTED');
                $q->whereRaw('assessment_attempts.id = (SELECT MAX(id) FROM assessment_attempts aa2 WHERE aa2.candidate_user_id = assessment_attempts.candidate_user_id AND aa2.assessment_id = assessment_attempts.assessment_id AND aa2.is_deleted = 0 AND aa2.status = "SCORED")');
            })
            ->where('organization_id', $orgId)
            ->where('is_deleted', 0)
            ->whereRaw('id = (SELECT MAX(id) FROM assessment_results ar2 WHERE ar2.assessment_attempt_id = assessment_results.assessment_attempt_id AND ar2.is_deleted = 0)')
            ->orderBy('calculated_at', 'desc')
            ->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=selected_candidates.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['First Name', 'Last Name', 'Email', 'Score', 'Result', 'Scored Date'];

        $callback = function () use ($results, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($results as $result) {
                $row['First Name']  = $result->candidate->first_name ?? '';
                $row['Last Name']   = $result->candidate->last_name ?? '';
                $row['Email']       = $result->candidate->email ?? '';
                $row['Score']       = ($result->overall_percentage ?? 0) . '%';
                $row['Result']      = $result->pass_fail_status;
                $row['Scored Date'] = ($result->calculated_at ?? $result->created_date)->format('Y-m-d H:i:s');

                fputcsv($file, [$row['First Name'], $row['Last Name'], $row['Email'], $row['Score'], $row['Result'], $row['Scored Date']]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
