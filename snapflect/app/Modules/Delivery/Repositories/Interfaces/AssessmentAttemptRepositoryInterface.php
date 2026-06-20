<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Modules\Delivery\Models\AssessmentAttempt;

interface AssessmentAttemptRepositoryInterface
{
    public function findById(int $id): ?AssessmentAttempt;\n    public function findByUuid(string $uuid): ?AssessmentAttempt;\n    public function findByIdWithRelations(int $id, array $relations): ?AssessmentAttempt;\n    public function findByUuidWithRelations(string $uuid, array $relations): ?AssessmentAttempt;\n    public function findWithTrashed(int $id): ?AssessmentAttempt;\n    public function findOnlyTrashed(int $id): ?AssessmentAttempt;\n    public function findActiveAttempt(int $organizationId, int $candidateId, int $assessmentVersionId): ?AssessmentAttempt;\n    public function findSubmittedAttempt(int $organizationId, int $candidateId, int $assessmentVersionId): ?AssessmentAttempt;\n    public function findExpiredAttempts(): Collection;\n    public function findBySnapshot(int $snapshotId): Collection;\n    public function paginateByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator;\n    public function query(): Builder;\n    public function create(array $data): AssessmentAttempt;\n    public function update(AssessmentAttempt $attempt, array $data): bool;
}
