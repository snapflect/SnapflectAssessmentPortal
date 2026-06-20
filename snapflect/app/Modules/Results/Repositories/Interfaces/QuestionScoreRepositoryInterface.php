<?php

declare(strict_types=1);

namespace App\Modules\Results\Repositories\Interfaces;

use App\Modules\Results\Models\QuestionScore;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface QuestionScoreRepositoryInterface
{
    public function query(): Builder;
    public function findById(int $id): ?QuestionScore;
    public function findByUuid(string $uuid): ?QuestionScore;
    public function findByUuidWithRelations(string $uuid): ?QuestionScore;
    public function findWithTrashed(int $id): ?QuestionScore;
    public function findOnlyTrashed(): Collection;
    public function paginateByOrganization(int $organizationId): LengthAwarePaginator;
    public function search(string $term): Collection;
    public function findByResult(int $resultId): \Illuminate\Database\Eloquent\Collection;
    public function findManualReviewRequired(): \Illuminate\Database\Eloquent\Collection;
}
