<?php

declare(strict_types=1);

namespace App\Modules\Results\Repositories\Interfaces;

use App\Modules\Results\Models\ResultPublication;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface ResultPublicationRepositoryInterface
{
    public function query(): Builder;
    public function findById(int $id): ?ResultPublication;
    public function findByUuid(string $uuid): ?ResultPublication;
    public function findByUuidWithRelations(string $uuid): ?ResultPublication;
    public function findWithTrashed(int $id): ?ResultPublication;
    public function findOnlyTrashed(): Collection;
    public function paginateByOrganization(int $organizationId): LengthAwarePaginator;
    public function search(string $term): Collection;
    public function findPublished(): \Illuminate\Database\Eloquent\Collection;
    public function findArchived(): \Illuminate\Database\Eloquent\Collection;
    public function findDrafts(): \Illuminate\Database\Eloquent\Collection;
}
