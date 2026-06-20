<?php

declare(strict_types=1);

namespace App\Modules\Results\Repositories\Eloquent;

use App\Modules\Results\Models\ResultPublication;
use App\Modules\Results\Repositories\Interfaces\ResultPublicationRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class ResultPublicationRepository
 * 
 * NOTE: Repositories never start transactions.
 * Services own transactions.
 */
class ResultPublicationRepository implements ResultPublicationRepositoryInterface
{
    public function query(): Builder
    {
        return ResultPublication::query();
    }

    public function findById(int $id): ?ResultPublication
    {
        return $this->query()->find($id);
    }

    public function findByUuid(string $uuid): ?ResultPublication
    {
        return $this->query()->where('uuid', $uuid)->first();
    }

    public function findByUuidWithRelations(string $uuid): ?ResultPublication
    {
        return $this->query()
            ->with(['assessmentResult', 'publisher'])
            ->where('uuid', $uuid)
            ->first();
    }

    public function findWithTrashed(int $id): ?ResultPublication
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
        return $this->query()->where('publication_status', 'PUBLISHED')->get();
    }

    public function findArchived(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->query()->where('publication_status', 'ARCHIVED')->get();
    }

    public function findDrafts(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->query()->where('publication_status', 'DRAFT')->get();
    }
}
