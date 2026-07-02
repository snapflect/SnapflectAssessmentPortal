<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Modules\Delivery\Models\AssessmentSession;

interface AssessmentSessionRepositoryInterface
{
public function findById(int $id): ?AssessmentSession;
public function findByUuid(string $uuid): ?AssessmentSession;
public function findByIdWithRelations(int $id, array $relations): ?AssessmentSession;
public function findByUuidWithRelations(string $uuid, array $relations): ?AssessmentSession;
public function findWithTrashed(int $id): ?AssessmentSession;
public function findOnlyTrashed(int $id): ?AssessmentSession;
public function findBySessionToken(string $token): ?AssessmentSession;
public function findActiveSessionByCandidate(int $organizationId, int $candidateId): ?AssessmentSession;
public function findExpiredSessions(): Collection;
public function paginateByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator;
public function query(): Builder;
public function create(array $data): AssessmentSession;
public function update(AssessmentSession $session, array $data): bool;
}
