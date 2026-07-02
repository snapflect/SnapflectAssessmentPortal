<?php

declare(strict_types=1);

namespace App\Modules\Results\Repositories\Eloquent;

use App\Modules\Results\Models\ResultVersion;
use App\Modules\Results\Repositories\Interfaces\ResultVersionRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class ResultVersionRepository
 * 
 * NOTE: Repositories never start transactions.
 * Services own transactions.
 */
class ResultVersionRepository implements ResultVersionRepositoryInterface
{
    public function query(): Builder
    {
        return ResultVersion::query();
    }

    public function findById(int $id): ?ResultVersion
    {
        return $this->query()->find($id);
    }

    public function findByUuid(string $uuid): ?ResultVersion
    {
        return $this->query()->where('uuid', $uuid)->first();
    }

    public function findByUuidWithRelations(string $uuid): ?ResultVersion
    {
        return $this->query()
            ->with(['assessmentResult'])
            ->where('uuid', $uuid)
            ->first();
    }

    public function findWithTrashed(int $id): ?ResultVersion
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
    public function findCurrentVersion(int $resultId): ?ResultVersion
    {
        return $this->query()
            ->where('assessment_result_id', $resultId)
            ->where('is_current_version', 1)
            ->first();
    }

    public function findVersions(int $resultId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->query()
            ->where('assessment_result_id', $resultId)
            ->orderBy('version_number', 'desc')
            ->get();
    }
}
