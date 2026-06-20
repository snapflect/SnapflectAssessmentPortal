<?php

declare(strict_types=1);

namespace App\Modules\Results\Repositories\Interfaces;

use App\Modules\Results\Models\ManualScoreReview;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface ManualScoreReviewRepositoryInterface
{
    public function query(): Builder;
    public function findById(int $id): ?ManualScoreReview;
    public function findByUuid(string $uuid): ?ManualScoreReview;
    public function findByUuidWithRelations(string $uuid): ?ManualScoreReview;
    public function findWithTrashed(int $id): ?ManualScoreReview;
    public function findOnlyTrashed(): Collection;
    public function paginateByOrganization(int $organizationId): LengthAwarePaginator;
    public function search(string $term): Collection;
    public function findPending(): \Illuminate\Database\Eloquent\Collection;
    public function findInReview(): \Illuminate\Database\Eloquent\Collection;
    public function findCompleted(): \Illuminate\Database\Eloquent\Collection;
    public function findByReviewer(int $reviewerId): \Illuminate\Database\Eloquent\Collection;
}
