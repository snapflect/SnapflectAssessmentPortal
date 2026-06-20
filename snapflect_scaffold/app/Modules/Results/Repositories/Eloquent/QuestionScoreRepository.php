<?php

declare(strict_types=1);

namespace App\Modules\Results\Repositories\Eloquent;

use App\Modules\Results\Models\QuestionScore;
use App\Modules\Results\Repositories\Interfaces\QuestionScoreRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class QuestionScoreRepository
 * 
 * NOTE: Repositories never start transactions.
 * Services own transactions.
 */
class QuestionScoreRepository implements QuestionScoreRepositoryInterface
{
    public function query(): Builder
    {
        return QuestionScore::query();
    }

    public function findById(int $id): ?QuestionScore
    {
        return $this->query()->find($id);
    }

    public function findByUuid(string $uuid): ?QuestionScore
    {
        return $this->query()->where('uuid', $uuid)->first();
    }

    public function findByUuidWithRelations(string $uuid): ?QuestionScore
    {
        return $this->query()
            ->with(['assessmentResult', 'question', 'attemptQuestion'])
            ->where('uuid', $uuid)
            ->first();
    }

    public function findWithTrashed(int $id): ?QuestionScore
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
    public function findByResult(int $resultId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->query()->where('assessment_result_id', $resultId)->get();
    }

    public function findManualReviewRequired(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->query()
            ->where('scoring_type', 'MANUAL')
            ->orWhere('scoring_type', 'HYBRID')
            ->get();
    }
}
