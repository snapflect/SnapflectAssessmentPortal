<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Repositories\Eloquent;

use App\Modules\Delivery\Repositories\Interfaces\AssessmentAttemptRepositoryInterface;
use App\Modules\Delivery\Models\AssessmentAttempt;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class AssessmentAttemptRepository implements AssessmentAttemptRepositoryInterface
{
    public function findById(int $id): ?AssessmentAttempt
    {
        return AssessmentAttempt::find($id);
    }

    public function findByUuid(string $uuid): ?AssessmentAttempt
    {
        return AssessmentAttempt::where('uuid', $uuid)->first();
    }

    public function findByIdWithRelations(int $id, array $relations): ?AssessmentAttempt
    {
        return AssessmentAttempt::with($relations)->find($id);
    }

    public function findByUuidWithRelations(string $uuid, array $relations): ?AssessmentAttempt
    {
        return AssessmentAttempt::with($relations)->where('uuid', $uuid)->first();
    }

    public function findWithTrashed(int $id): ?AssessmentAttempt
    {
        return AssessmentAttempt::withTrashed()->find($id);
    }

    public function findOnlyTrashed(int $id): ?AssessmentAttempt
    {
        return AssessmentAttempt::onlyTrashed()->find($id);
    }

    public function findActiveAttempt(int $organizationId, int $candidateId, int $assessmentVersionId): ?AssessmentAttempt
    {
        return AssessmentAttempt::where('organization_id', $organizationId)
            ->where('candidate_user_id', $candidateId)
            ->where('assessment_version_id', $assessmentVersionId)
            ->whereIn('status', ['NOT_STARTED', 'IN_PROGRESS'])
            ->first();
    }

    public function findSubmittedAttempt(int $organizationId, int $candidateId, int $assessmentVersionId): ?AssessmentAttempt
    {
        return AssessmentAttempt::where('organization_id', $organizationId)
            ->where('candidate_user_id', $candidateId)
            ->where('assessment_version_id', $assessmentVersionId)
            ->where('status', 'SUBMITTED')
            ->first();
    }

    public function findExpiredAttempts(): Collection
    {
        return AssessmentAttempt::where('expires_at', '<', now())
            ->whereIn('status', ['NOT_STARTED', 'IN_PROGRESS'])
            ->get();
    }

    public function findBySnapshot(int $snapshotId): Collection
    {
        return AssessmentAttempt::where('assessment_snapshot_id', $snapshotId)->get();
    }

    public function paginateByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator
    {
        return AssessmentAttempt::where('organization_id', $organizationId)->paginate($perPage);
    }

    public function query(): Builder
    {
        return AssessmentAttempt::query();
    }

    public function create(array $data): AssessmentAttempt
    {
        return AssessmentAttempt::create($data);
    }

    public function update(AssessmentAttempt $attempt, array $data): bool
    {
        return $attempt->update($data);
    }
}
