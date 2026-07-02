<?php

declare(strict_types=1);

namespace App\Modules\Results\Repositories\Interfaces;

use App\Modules\Results\Models\AssessmentResult;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface AssessmentResultRepositoryInterface
{
    public function query(): Builder;
    public function findById(int $id): ?AssessmentResult;
    public function findByUuid(string $uuid): ?AssessmentResult;
    public function findByUuidWithRelations(string $uuid): ?AssessmentResult;
    public function findWithTrashed(int $id): ?AssessmentResult;
    public function findOnlyTrashed(): Collection;
    public function paginateByOrganization(int $organizationId): LengthAwarePaginator;
    public function search(string $term): Collection;
    public function findPublished(): \Illuminate\Database\Eloquent\Collection;
    public function findByCandidate(int $candidateUserId): \Illuminate\Database\Eloquent\Collection;
    public function findByAssessment(int $assessmentId): \Illuminate\Database\Eloquent\Collection;
    public function findReadyForPublication(): \Illuminate\Database\Eloquent\Collection;
    public function findByStatus(string $status): \Illuminate\Database\Eloquent\Collection;
}
