<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Modules\Delivery\Models\AssessmentAttempt;

interface AssessmentAttemptRepositoryInterface
{
public function findById(int $id): ?AssessmentAttempt;
public function findByUuid(string $uuid): ?AssessmentAttempt;
public function findByIdWithRelations(int $id, array $relations): ?AssessmentAttempt;
public function findByUuidWithRelations(string $uuid, array $relations): ?AssessmentAttempt;
public function findWithTrashed(int $id): ?AssessmentAttempt;
public function findOnlyTrashed(int $id): ?AssessmentAttempt;
public function findActiveAttempt(int $organizationId, int $candidateId, int $assessmentVersionId): ?AssessmentAttempt;
public function findSubmittedAttempt(int $organizationId, int $candidateId, int $assessmentVersionId): ?AssessmentAttempt;
public function findExpiredAttempts(): Collection;
public function findBySnapshot(int $snapshotId): Collection;
public function paginateByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator;
public function query(): Builder;
public function create(array $data): AssessmentAttempt;
public function update(AssessmentAttempt $attempt, array $data): bool;
}
