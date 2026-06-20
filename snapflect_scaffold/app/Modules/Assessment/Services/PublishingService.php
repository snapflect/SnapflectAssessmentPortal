<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Services;

use App\Modules\Assessment\DTOs\PublishAssessmentDto;
use App\Modules\Assessment\Repositories\Interfaces\AssessmentRepositoryInterface;
use App\Modules\Assessment\Repositories\Interfaces\PublicationRepositoryInterface;
use Illuminate\Support\Facades\DB;

class PublishingService
{
    private AssessmentRepositoryInterface $assessmentRepo;
    private PublicationRepositoryInterface $publicationRepo;
    private AssessmentSnapshotService $snapshotService;
    private VersionService $versionService;

    public function __construct(
        AssessmentRepositoryInterface $assessmentRepo,
        PublicationRepositoryInterface $publicationRepo,
        AssessmentSnapshotService $snapshotService,
        VersionService $versionService
    ) {
        $this->assessmentRepo = $assessmentRepo;
        $this->publicationRepo = $publicationRepo;
        $this->snapshotService = $snapshotService;
        $this->versionService = $versionService;
    }

    public function publish(PublishAssessmentDto $dto, int $publishedBy): array
    {
        return DB::transaction(function () use ($dto, $publishedBy) {
            $assessment = $this->assessmentRepo->findByUuid($dto->assessment_uuid);
            
            if ($assessment->current_state !== 'IN_REVIEW') {
                throw new \Exception("State Transition Forbidden. Assessment must be IN_REVIEW to be PUBLISHED.");
            }

            // 1. Update State
            $this->assessmentRepo->update($assessment->id, [
                'current_state' => 'PUBLISHED',
                'is_published' => true
            ]);

            // 2. Create Version
            $version = $this->versionService->lockVersion($assessment->id);

            // 3. Create Immutable Snapshot
            $snapshot = $this->snapshotService->createSnapshot($assessment->id, $version->id, $publishedBy);

            // 4. Create Publication Record
            $publication = $this->publicationRepo->create([
                'assessment_id' => $assessment->id,
                'assessment_version_id' => $version->id,
                'assessment_snapshot_id' => $snapshot->id,
                'published_by' => $publishedBy,
                'published_date' => now(),
                'publication_notes' => $dto->publication_notes
            ]);

            return $publication->toArray();
        });
    }
}
