<?php

declare(strict_types=1);

namespace App\Modules\Results\Repositories\Eloquent;

use App\Modules\Results\Models\CompetencyScore;
use App\Modules\Results\Repositories\Interfaces\CompetencyScoreRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class CompetencyScoreRepository
 * 
 * NOTE: Repositories never start transactions.
 * Services own transactions.
 */
class CompetencyScoreRepository implements CompetencyScoreRepositoryInterface
{
    public function query(): Builder
    {
        return CompetencyScore::query();
    }

    public function findById(int $id): ?CompetencyScore
    {
        return $this->query()->find($id);
    }

    public function findByUuid(string $uuid): ?CompetencyScore
    {
        return $this->query()->where('uuid', $uuid)->first();
    }

    public function findByUuidWithRelations(string $uuid): ?CompetencyScore
    {
        return $this->query()
            ->with(['assessmentResult', 'competency'])
            ->where('uuid', $uuid)
            ->first();
    }

    public function findWithTrashed(int $id): ?CompetencyScore
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

    public function findPassedCompetencies(int $resultId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->query()
            ->where('assessment_result_id', $resultId)
            ->where('competency_status', 'PASS')
            ->get();
    }

    public function findFailedCompetencies(int $resultId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->query()
            ->where('assessment_result_id', $resultId)
            ->where('competency_status', 'FAIL')
            ->get();
    }
}
