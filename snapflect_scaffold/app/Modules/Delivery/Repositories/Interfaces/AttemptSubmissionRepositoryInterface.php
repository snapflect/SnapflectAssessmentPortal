<?php

declare(strict_types=1);

namespace App\Modules\Delivery\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Modules\Delivery\Models\AttemptSubmission;

interface AttemptSubmissionRepositoryInterface
{
    public function findById(int $id): ?AttemptSubmission;\n    public function findByUuid(string $uuid): ?AttemptSubmission;\n    public function findByIdWithRelations(int $id, array $relations): ?AttemptSubmission;\n    public function findByUuidWithRelations(string $uuid, array $relations): ?AttemptSubmission;\n    public function findByAttempt(int $attemptId): ?AttemptSubmission;\n    public function create(array $data): AttemptSubmission;\n    public function query(): Builder;
}
