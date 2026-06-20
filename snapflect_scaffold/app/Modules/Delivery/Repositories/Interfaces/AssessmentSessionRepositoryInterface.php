<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Modules\Delivery\Models\AssessmentSession;

interface AssessmentSessionRepositoryInterface
{
    public function findById(int $id): ?AssessmentSession;\n    public function findByUuid(string $uuid): ?AssessmentSession;\n    public function findByIdWithRelations(int $id, array $relations): ?AssessmentSession;\n    public function findByUuidWithRelations(string $uuid, array $relations): ?AssessmentSession;\n    public function findWithTrashed(int $id): ?AssessmentSession;\n    public function findOnlyTrashed(int $id): ?AssessmentSession;\n    public function findBySessionToken(string $token): ?AssessmentSession;\n    public function findActiveSessionByCandidate(int $organizationId, int $candidateId): ?AssessmentSession;\n    public function findExpiredSessions(): Collection;\n    public function paginateByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator;\n    public function query(): Builder;\n    public function create(array $data): AssessmentSession;\n    public function update(AssessmentSession $session, array $data): bool;
}
