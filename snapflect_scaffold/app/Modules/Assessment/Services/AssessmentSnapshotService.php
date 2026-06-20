<?php

declare(strict_types=1);

namespace App\Modules\Assessment\Services;

use App\Modules\Assessment\Repositories\Interfaces\AssessmentRepositoryInterface;
use Illuminate\Support\Facades\DB;

class AssessmentSnapshotService
{
    private AssessmentRepositoryInterface $assessmentRepo;

    public function __construct(AssessmentRepositoryInterface $assessmentRepo)
    {
        $this->assessmentRepo = $assessmentRepo;
    }

    public function createSnapshot(int $assessmentId, int $versionId, int $publishedBy)
    {
        return DB::transaction(function () use ($assessmentId, $versionId, $publishedBy) {
            // 1. Deep serialize entire assessment blueprint, competencies, and rules
            // Eager loading resolves this instantly (preventing N+1)
            $assessment = $this->assessmentRepo->findByIdWithRelations($assessmentId, [
                'blueprint.sections.rules',
                'blueprint.sections.sectionQuestions',
                'competencies',
            ]);

            $snapshotJson = json_encode($assessment->toArray());
            $snapshotHash = hash('sha256', $snapshotJson);

            // 2. Persist Immutable Snapshot
            // Utilizing raw DB insert or a specific snapshot repository (skipped injection for brevity)
            $id = DB::table('assessment_snapshots')->insertGetId([
                'uuid' => (string) \Illuminate\Support\Str::uuid(),
                'organization_id' => $assessment->organization_id,
                'assessment_id' => $assessmentId,
                'assessment_version_id' => $versionId,
                'snapshot_json' => $snapshotJson,
                'snapshot_hash' => $snapshotHash,
                'published_by' => $publishedBy,
                'published_date' => now(),
                'status' => 'ACTIVE'
            ]);

            return DB::table('assessment_snapshots')->find($id);
        });
    }
}
