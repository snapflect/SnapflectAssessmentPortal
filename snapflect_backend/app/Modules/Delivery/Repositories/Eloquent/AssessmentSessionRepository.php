<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Repositories\Eloquent;

use App\Modules\Delivery\Repositories\Interfaces\AssessmentSessionRepositoryInterface;
use App\Modules\Delivery\Models\AssessmentSession;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class AssessmentSessionRepository implements AssessmentSessionRepositoryInterface
{
    public function findById(int $id): ?AssessmentSession
    {
        return AssessmentSession::find($id);
    }

    public function findByUuid(string $uuid): ?AssessmentSession
    {
        return AssessmentSession::where('uuid', $uuid)->first();
    }

    public function findByIdWithRelations(int $id, array $relations): ?AssessmentSession
    {
        return AssessmentSession::with($relations)->find($id);
    }

    public function findByUuidWithRelations(string $uuid, array $relations): ?AssessmentSession
    {
        return AssessmentSession::with($relations)->where('uuid', $uuid)->first();
    }

    public function findWithTrashed(int $id): ?AssessmentSession
    {
        return AssessmentSession::withTrashed()->find($id);
    }

    public function findOnlyTrashed(int $id): ?AssessmentSession
    {
        return AssessmentSession::onlyTrashed()->find($id);
    }

    public function findBySessionToken(string $token): ?AssessmentSession
    {
        return AssessmentSession::where('session_token', $token)->first();
    }

    public function findActiveSessionByCandidate(int $organizationId, int $candidateId): ?AssessmentSession
    {
        return AssessmentSession::where('organization_id', $organizationId)
            ->where('candidate_user_id', $candidateId)
            ->where('session_status', 'ACTIVE')
            ->first();
    }

    public function findExpiredSessions(): Collection
    {
        return AssessmentSession::where('access_expires_at', '<', now())
            ->where('session_status', 'ACTIVE')
            ->get();
    }

    public function paginateByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator
    {
        return AssessmentSession::where('organization_id', $organizationId)->paginate($perPage);
    }

    public function query(): Builder
    {
        return AssessmentSession::query();
    }

    public function create(array $data): AssessmentSession
    {
        return AssessmentSession::create($data);
    }

    public function update(AssessmentSession $session, array $data): bool
    {
        return $session->update($data);
    }
}
