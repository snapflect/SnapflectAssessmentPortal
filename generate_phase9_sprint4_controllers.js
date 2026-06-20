const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'snapflect', 'app', 'Modules', 'Results', 'Controllers');
if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

const writePhpFile = (filePath, content) => {
    fs.writeFileSync(filePath, content);
};

const controllers = [
    {
        name: 'AssessmentResultController',
        content: `<?php

declare(strict_types=1);

namespace App\\Modules\\Results\\Controllers;

use App\\Http\\Controllers\\Controller;
use App\\Modules\\Results\\Models\\AssessmentResult;
use App\\Modules\\Results\\Services\\ResultService;
use App\\Modules\\Results\\Requests\\CalculateResultRequest;
use App\\Modules\\Results\\Requests\\RecalculateResultRequest;
use App\\Modules\\Results\\Resources\\AssessmentResultResource;
use App\\Modules\\Results\\Resources\\QuestionScoreResource;
use App\\Modules\\Results\\Resources\\SectionScoreResource;
use App\\Modules\\Results\\Resources\\CompetencyScoreResource;
use App\\Modules\\Results\\Resources\\ResultSnapshotResource;
use App\\Modules\\Results\\Resources\\ResultAuditResource;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Request;

class AssessmentResultController extends Controller
{
    public function __construct(private readonly ResultService $resultService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', AssessmentResult::class);

        // Standard index fetch logic utilizing Repositories conceptually via injected queries
        // Placeholder return
        return response()->json([
            'success' => true,
            'message' => 'Results retrieved successfully.',
            'data' => []
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
`
    },
    {
        name: 'ResultPublicationController',
        content: `<?php

declare(strict_types=1);

namespace App\\Modules\\Results\\Controllers;

use App\\Http\\Controllers\\Controller;
use App\\Modules\\Results\\Models\\AssessmentResult;
use App\\Modules\\Results\\Models\\ResultPublication;
use App\\Modules\\Results\\Services\\PublicationService;
use App\\Modules\\Results\\Requests\\PublishResultRequest;
use App\\Modules\\Results\\Requests\\ArchiveResultRequest;
use App\\Modules\\Results\\Resources\\ResultPublicationResource;
use Illuminate\\Http\\JsonResponse;

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
`
    },
    {
        name: 'ManualReviewController',
        content: `<?php

declare(strict_types=1);

namespace App\\Modules\\Results\\Controllers;

use App\\Http\\Controllers\\Controller;
use App\\Modules\\Results\\Models\\ManualScoreReview;
use App\\Modules\\Results\\Services\\ManualReviewService;
use App\\Modules\\Results\\Requests\\CreateManualReviewRequest;
use App\\Modules\\Results\\Requests\\UpdateManualReviewRequest;
use App\\Modules\\Results\\Resources\\ManualScoreReviewResource;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Request;

class ManualReviewController extends Controller
{
    public function __construct(private readonly ManualReviewService $manualReviewService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', ManualScoreReview::class);

        return response()->json([
            'success' => true,
            'message' => 'Manual reviews retrieved successfully.',
            'data' => []
        ]);
    }

    public function show(ManualScoreReview $manualReview): JsonResponse
    {
        $this->authorize('view', $manualReview);

        return response()->json([
            'success' => true,
            'message' => 'Manual review retrieved successfully.',
            'data' => new ManualScoreReviewResource($manualReview)
        ]);
    }

    public function store(CreateManualReviewRequest $request): JsonResponse
    {
        $this->authorize('create', ManualScoreReview::class);

        $review = $this->manualReviewService->createReview(
            $request->toDto(),
            $request->user()->organization_id,
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Manual review created successfully.',
            'data' => new ManualScoreReviewResource($review)
        ], 201);
    }

    public function update(UpdateManualReviewRequest $request, ManualScoreReview $manualReview): JsonResponse
    {
        $this->authorize('update', $manualReview);

        $updatedReview = $this->manualReviewService->updateReview(
            $request->toDto(),
            $request->user()->organization_id,
            $request->user()->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Manual review updated successfully.',
            'data' => new ManualScoreReviewResource($updatedReview)
        ]);
    }
}
`
    },
    {
        name: 'ReportingController',
        content: `<?php

declare(strict_types=1);

namespace App\\Modules\\Results\\Controllers;

use App\\Http\\Controllers\\Controller;
use App\\Modules\\Results\\Services\\ReportingService;
use Illuminate\\Http\\JsonResponse;
use Illuminate\\Http\\Request;
// use App\\Modules\\Results\\Requests\\ResultFilterRequest; // Assuming a filter request handles DTO generation
use App\\Modules\\Results\\DTOs\\ResultFilterDto;

class ReportingController extends Controller
{
    public function __construct(private readonly ReportingService $reportingService)
    {
    }

    public function assessmentReport(Request $request): JsonResponse
    {
        // $this->authorize('viewReports', AssessmentResult::class);
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
`
    }
];

controllers.forEach(ctrl => {
    writePhpFile(path.join(baseDir, `${ctrl.name}.php`), ctrl.content);
});

console.log('Sprint 04 Phase 9 Controllers generated successfully.');
