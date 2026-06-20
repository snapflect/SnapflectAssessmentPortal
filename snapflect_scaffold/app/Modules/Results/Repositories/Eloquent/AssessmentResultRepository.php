<?php

declare(strict_types=1);

namespace App\Modules\Results\Repositories\Eloquent;

use App\Modules\Results\Models\AssessmentResult;
use App\Modules\Results\Repositories\Interfaces\AssessmentResultRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class AssessmentResultRepository
 * 
 * NOTE: Repositories never start transactions.
 * Services own transactions.
 */
class AssessmentResultRepository implements AssessmentResultRepositoryInterface
{
    public function query(): Builder
    {
        return AssessmentResult::query();
    }

    public function findById(int $id): ?AssessmentResult
    {
        return $this->query()->find($id);
    }

    public function findByUuid(string $uuid): ?AssessmentResult
    {
        return $this->query()->where('uuid', $uuid)->first();
    }

    public function findByUuidWithRelations(string $uuid): ?AssessmentResult
    {
        return $this->query()
            ->with(['organization', 'assessment', 'assessmentVersion', 'assessmentSnapshot', 'assessmentAttempt', 'candidate', 'resultVersions', 'questionScores', 'sectionScores', 'competencyScores', 'resultRules', 'resultPublications', 'resultAudits', 'resultSnapshots', 'manualScoreReviews'])
            ->where('uuid', $uuid)
            ->first();
    }

    public function findWithTrashed(int $id): ?AssessmentResult
    {
        // Mutable models support soft deletes conceptually by is_deleted flags if not using Laravel SoftDeletes trait.
        // Assuming custom is_deleted implementation based on Schema:
        return $this->query()->withoutGlobalScope('active')->find($id);
    }

    public function findOnlyTrashed(): Collection
    {
        return $this->query()->withoutGlobalScope('active')->where('is_deleted', 1)->get();
    }

    public function paginateByOrganization(int $organizationId): LengthAwarePaginator
    {
        return $this->query()->where('organization_id', $organizationId)->paginate();
    }

    public function search(string $term): Collection
    {
        // Simple search abstraction
        return $this->query()
            ->where('uuid', 'LIKE', "%{$term}%")
            ->get();
    }
    public function findPublished(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->query()->where('result_status', 'PUBLISHED')->get();
    }

    public function findByCandidate(int $candidateUserId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->query()->where('candidate_user_id', $candidateUserId)->get();
    }

    public function findByAssessment(int $assessmentId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->query()->where('assessment_id', $assessmentId)->get();
    }

    public function findReadyForPublication(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->query()->where('result_status', 'READY')->get();
    }

    public function findByStatus(string $status): \Illuminate\Database\Eloquent\Collection
    {
        return $this->query()->where('result_status', $status)->get();
    }
}
