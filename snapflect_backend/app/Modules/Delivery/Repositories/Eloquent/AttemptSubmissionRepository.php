<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Repositories\Eloquent;

use App\Modules\Delivery\Repositories\Interfaces\AttemptSubmissionRepositoryInterface;
use App\Modules\Delivery\Models\AttemptSubmission;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class AttemptSubmissionRepository implements AttemptSubmissionRepositoryInterface
{
    public function findById(int $id): ?AttemptSubmission
    {
        return AttemptSubmission::find($id);
    }

    public function findByUuid(string $uuid): ?AttemptSubmission
    {
        return AttemptSubmission::where('uuid', $uuid)->first();
    }

    public function findByIdWithRelations(int $id, array $relations): ?AttemptSubmission
    {
        return AttemptSubmission::with($relations)->find($id);
    }

    public function findByUuidWithRelations(string $uuid, array $relations): ?AttemptSubmission
    {
        return AttemptSubmission::with($relations)->where('uuid', $uuid)->first();
    }

    public function findByAttempt(int $attemptId): ?AttemptSubmission
    {
        return AttemptSubmission::where('assessment_attempt_id', $attemptId)->first();
    }

    public function create(array $data): AttemptSubmission
    {
        return AttemptSubmission::create($data);
    }

    public function query(): Builder
    {
        return AttemptSubmission::query();
    }
}
