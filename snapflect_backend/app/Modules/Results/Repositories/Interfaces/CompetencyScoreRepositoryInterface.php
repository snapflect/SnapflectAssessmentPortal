<?php

declare(strict_types=1);

namespace App\Modules\Results\Repositories\Interfaces;

use App\Modules\Results\Models\CompetencyScore;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface CompetencyScoreRepositoryInterface
{
    public function query(): Builder;
    public function findById(int $id): ?CompetencyScore;
    public function findByUuid(string $uuid): ?CompetencyScore;
    public function findByUuidWithRelations(string $uuid): ?CompetencyScore;
    public function findWithTrashed(int $id): ?CompetencyScore;
    public function findOnlyTrashed(): Collection;
    public function paginateByOrganization(int $organizationId): LengthAwarePaginator;
    public function search(string $term): Collection;
    public function findByResult(int $resultId): \Illuminate\Database\Eloquent\Collection;
    public function findPassedCompetencies(int $resultId): \Illuminate\Database\Eloquent\Collection;
    public function findFailedCompetencies(int $resultId): \Illuminate\Database\Eloquent\Collection;
}
