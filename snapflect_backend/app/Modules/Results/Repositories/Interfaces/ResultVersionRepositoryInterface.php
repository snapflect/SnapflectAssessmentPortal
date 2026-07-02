<?php

declare(strict_types=1);

namespace App\Modules\Results\Repositories\Interfaces;

use App\Modules\Results\Models\ResultVersion;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface ResultVersionRepositoryInterface
{
    public function query(): Builder;
    public function findById(int $id): ?ResultVersion;
    public function findByUuid(string $uuid): ?ResultVersion;
    public function findByUuidWithRelations(string $uuid): ?ResultVersion;
    public function findWithTrashed(int $id): ?ResultVersion;
    public function findOnlyTrashed(): Collection;
    public function paginateByOrganization(int $organizationId): LengthAwarePaginator;
    public function search(string $term): Collection;
    public function findCurrentVersion(int $resultId): ?ResultVersion;
    public function findVersions(int $resultId): \Illuminate\Database\Eloquent\Collection;
}
