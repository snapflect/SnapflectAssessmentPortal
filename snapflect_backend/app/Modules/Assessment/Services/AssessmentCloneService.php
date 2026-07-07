<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Services;

use App\Modules\Assessment\DTOs\CloneAssessmentDto;
use App\Modules\Assessment\Repositories\Interfaces\AssessmentRepositoryInterface;
use Illuminate\Support\Facades\DB;

class AssessmentCloneService
{
    private AssessmentRepositoryInterface $assessmentRepo;
    private BlueprintService $blueprintService;

    public function __construct(
        AssessmentRepositoryInterface $assessmentRepo,
        BlueprintService $blueprintService
    ) {
        $this->assessmentRepo = $assessmentRepo;
        $this->blueprintService = $blueprintService;
    }

    public function cloneAssessment(CloneAssessmentDto $dto, int $clonedBy): array
    {
        return DB::transaction(function () use ($dto, $clonedBy) {
            $sourceAssessment = $this->assessmentRepo->findByUuid($dto->assessment_uuid);

            // 1. Clone Assessment Root
            $newAssessmentData = $sourceAssessment->toArray();
            unset($newAssessmentData['id'], $newAssessmentData['uuid']);
            $newAssessmentData['assessment_code'] = $sourceAssessment->assessment_code . '-COPY-' . strtoupper(\Illuminate\Support\Str::random(4));
            $newAssessmentData['current_state'] = 'DRAFT';
            $newAssessmentData['is_published'] = false;
            $newAssessmentData['created_by'] = $clonedBy;

            $newAssessment = $this->assessmentRepo->create($newAssessmentData);

            // 2. Deep Clone Blueprint & Competencies
            $this->blueprintService->cloneBlueprint($sourceAssessment->id, $newAssessment->id, $clonedBy);

            // 3. Create initial version record linking to parent
            // $this->versionService->createDraftVersion($newAssessment->id, $sourceAssessment->latest_version_id);

            return $newAssessment->toArray();
        });
    }
}
