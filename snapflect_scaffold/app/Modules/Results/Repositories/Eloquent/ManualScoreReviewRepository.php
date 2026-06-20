<?php

declare(strict_types=1);

namespace App\Modules\Results\Repositories\Eloquent;

use App\Modules\Results\Models\ManualScoreReview;
use App\Modules\Results\Repositories\Interfaces\ManualScoreReviewRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class ManualScoreReviewRepository
 * 
 * NOTE: Repositories never start transactions.
 * Services own transactions.
 */
class ManualScoreReviewRepository implements ManualScoreReviewRepositoryInterface
{
    public function query(): Builder
    {
        return ManualScoreReview::query();
    }

    public function findById(int $id): ?ManualScoreReview
    {
        return $this->query()->find($id);
    }

    public function findByUuid(string $uuid): ?ManualScoreReview
    {
        return $this->query()->where('uuid', $uuid)->first();
    }

    public function findByUuidWithRelations(string $uuid): ?ManualScoreReview
    {
        return $this->query()
            ->with(['assessmentResult', 'questionScore', 'reviewer'])
            ->where('uuid', $uuid)
            ->first();
    }

    public function findWithTrashed(int $id): ?ManualScoreReview
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
    public function findPending(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->query()->where('review_status', 'PENDING')->get();
    }

    public function findInReview(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->query()->where('review_status', 'IN_REVIEW')->get();
    }

    public function findCompleted(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->query()->where('review_status', 'COMPLETED')->get();
    }

    public function findByReviewer(int $reviewerId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->query()->where('reviewed_by', $reviewerId)->get();
    }
}
